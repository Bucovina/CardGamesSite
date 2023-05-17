const express = require("express");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');

const {Client} = require('pg');

const AccesBD = require('./module_proprii/accesbd.js');

AccesBD.getInstanta().select({
        tabel: "produse",
        campuri: ["nume", "pret", "componente"],
        conditiiAnd: ["pret>20"]
    }, function (err, rez) {
        console.log(err);
        console.log(rez);
    }
)

var client = new Client({
    database: "CardGamesSite", user: "postgres", password: "spatula", host: "localhost", port: 5432
});
client.connect();
client.query("select * from produse", function (err, rez) {
    /// console.log("Eroare BD", err);

    ///console.log("Rezultat BD", rez.rows);
});

obiectGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu: [],
}

client.query("select * from unnest(enum_range(null::categorie_produse))", function (err, rezCategorie) {
    if (err) {
        console.log(err);
    } else {
        obiectGlobal.optiuniMeniu = rezCategorie.rows;
    }
});

app = express();
//console.log("Folder", __dirname);
//console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

vectorFoldere = ["temp", "temp1", "backup"]
for (let folder of vectorFoldere) {
    // let caleFolder=__dirname+"/"+folder;
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
        // let vectorCale = caleScss.split("\\");
        // let numeFisExt = vectorCale[vectorCale.length - 1];
        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0];
        caleCss = numeFis + ".css";
    }
    if (!path.isAbsolute(caleScss)) caleScss = path.join(obiectGlobal.folderScss, caleScss)
    if (!path.isAbsolute(caleCss)) caleCss = path.join(obiectGlobal.folderCss, caleCss)
    // let vectorCale = caleCss.split("\\");
    // let numeFisCss = vectorCale[vectorCale.length - 1];
    let numeFisCss = path.basename(caleCss);
    let caleBackup = path.join(obiectGlobal.folderBackup, "resurse/css")
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, {recursive: true});
    }
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obiectGlobal.folderBackup, "resurse/css", numeFisCss))
    }
    rez = sass.compile(caleScss, {"sourceMap": true});
    fs.writeFileSync(caleCss, rez.css);
    /// console.log("Compilare SCSS", rez);
}

vFisiere = fs.readdirSync(obiectGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) === '.scss') {
        compileazaScss(numeFis);
    }
}

fs.watch(obiectGlobal.folderScss, function (eveniment, numeFis) {
    /// console.log(eveniment, numeFis);
    if (eveniment === "change" || eveniment === "rename") {
        let caleCompleta = path.join(obiectGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
});

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));

app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = obiectGlobal.optiuniMeniu;
    next();
})
app.use(/^\/resurse(\/[a-zA-Z0-9]*)*$/, function (req, res) {
    afisareEroare(res, 403);
});

app.get("/favicon.ico", function (req, res) {
    res.sendFile(__dirname + "/resurse/ico/favicon.ico");
});

app.get("/ceva", function (req, res) {
    console.log("cale:", req.url);
    res.send("altceva ip:" + req.ip);
})

app.get(["/index", "/", "/home"], function (req, res) {
    res.render("pagini/index", {ip: req.ip, a: 15, b: 12, imagini: obiectGlobal.obImagini.imagini});
})

app.get("/produse", function (req, res) {
    //TO DO query pentru a selecta toate produsele
    //TO DO se adauaga filtrarea dupa tipul produsului
    //TO DO se selecteaza si toate valorile din enum-ul categ_prajitura


    client.query("select * from unnest(enum_range(null::categorie_produse))", function (err, rezCategorie) {
        if (err) {
            console.log(err);
        } else {
            client.query("select * from unnest(enum_range(null::producatori))", function (err, rezProducatori) {
                if (err) {
                    console.log(err);
                } else {
                    let conditieWhere = "";
                    if (req.query.tip) conditieWhere = `where categorie_produs='${req.query.tip}'`;
                    client.query("select * from produse "+ conditieWhere, function (err, rez) {
                        console.log(300)
                        if (err) {
                            console.log(err);
                            afisareEroare(res, 2);
                        } else res.render("pagini/produse", {
                            produse: rez.rows, optiuni: rezCategorie.rows, produc: rezProducatori.rows,
                        });
                    });
                }
            })
        }
    })
});

app.get("/produs/:id", function (req, res) {
    client.query(`select * from produse where id = ${req.params.id}`, function (err, rezultat) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
        } else res.render("pagini/produs", {prod: rezultat.rows[0]});
    });
});

//^\w+\.ejs$
app.get("/*.ejs", function (req, res) {
    afisareEroare(res, 400);
})

app.get("/*", function (req, res) {
    try {
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                console.log(err);
                if (err.message.startsWith("Failed to lookup view")) afisareEroare(res, 404); else afisareEroare(res);
            } else {
                res.send(rezRandare);
            }
        });
    } catch (err) {
        if (err.message.startsWith("Cannot find module")) afisareEroare(res, 404); else afisareEroare(res);
    }
})

function initErori() {
    var continut = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf-8");
    obiectGlobal.obErori = JSON.parse(continut);
    let vErori = obiectGlobal.obErori.info_erori;
    ///for (let i = 0; i < vErori.length; i++)
    for (let eroare of vErori) {
        eroare.imagine = "/" + obiectGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
}

initErori();

function initImagini() {
    var continut = fs.readFileSync(__dirname + "/resurse/json/galerie.json").toString("utf-8");
    obiectGlobal.obImagini = JSON.parse(continut);
    let vImagini = obiectGlobal.obImagini.imagini;
    let caleAbs = path.join(__dirname, obiectGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    if (!fs.existsSync(caleAbsMediu)) {
        fs.mkdirSync(caleAbsMediu);
    }
    ///for (let i = 0; i < vErori.length; i++)
    for (let imag of vImagini) {
        [numeFis, ext] = imag.cale_fisier.split(".");
        let caleFisAbs = path.join(caleAbs, imag.cale_fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        imag.fisier_mediu = "/" + path.join(obiectGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp")
        imag.cale_fisier = "/" + path.join(obiectGlobal.obImagini.cale_galerie, imag.cale_fisier);
        ///imag.imagine = "/" + obiectGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
}

initImagini();

function afisareEroare(res, _identificator, _titlu = "titlu default", _text, _imagine) {
    let vErori = obiectGlobal.obErori.info_erori;
    let eroare = vErori.find(function (elem) {
        return elem.identificator === _identificator;
    })
    if (eroare) {
        let titlu1 = _titlu === "titlu default" ? (eroare.titlu || _titlu) : _titlu;
        let text1 = _text || eroare.text
        let imagine1 = _imagine || eroare.imagine
        if (eroare.status) res.status(eroare.identificator).render("pagini/eroare", {
            titlu: titlu1, text: text1, imagine: imagine1
        }); else res.render("pagini/eroare", {titlu: titlu1, text: text1, imagine: imagine1});
    } else {
        let errDef = obiectGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {
            titlu: errDef.titlu, text: errDef.text, imagine: obiectGlobal.obErori.cale_baza + "/" + errDef.imagine
        })
    }
}

app.listen(8080);
console.log("Server started!");
