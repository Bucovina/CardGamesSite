window.addEventListener("load", function () {

    let iduriProduse=localStorage.getItem("cos_virtual");
    iduriProduse=iduriProduse?iduriProduse.split(","):[];      //["3","1","10","4","2"]

    for(let idp of iduriProduse){
        let ch = document.querySelector(`[value='${idp}'].select-cos`);
        if(ch){
            ch.checked=true;
        }
        else{
            console.log("id cos virtual inexistent:", idp);
        }
    }

    //----------- adaugare date in cosul virtual (din localStorage)
    let checkboxuri= document.getElementsByClassName("select-cos");
    for(let ch of checkboxuri){
        ch.onchange=function(){
            let iduriProduse=localStorage.getItem("cos_virtual");
            iduriProduse=iduriProduse?iduriProduse.split(","):[];

            if( this.checked){
                iduriProduse.push(this.value)
            }
            else{
                let poz= iduriProduse.indexOf(this.value);
                if(poz != -1){
                    iduriProduse.splice(poz,1);
                }
            }

            localStorage.setItem("cos_virtual", iduriProduse.join(","))
        }

    }

    document.getElementById("inp-puncte").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }

    document.getElementById("filtrare").onclick = function () {
        let val_nume = document.getElementById("inp-nume").value.toLowerCase();
        let radiobuttons = document.getElementsByName("gr_rad");
        let producator;
        for (let r of radiobuttons) {
            if (r.checked) {
                producator = r.value;
                break;
            }
        }

        let var_puncte = document.getElementById("inp-puncte").value;

        let val_categ = document.getElementById("inp-categorie").value;

        let val_material = document.getElementById("inp-material").value;

        let val_colectie = document.getElementById("inp-colectie").checked.toString();

        let val_descriere = document.getElementById("inp-descriere").value.toLowerCase();

        let vector_desc = val_descriere.split(" ");

        let plus_desc = [];
        let minus_desc = [];

        for (let vec of vector_desc) {
            if (vec.trim().startsWith("+"))
                plus_desc.push(vec.split("+")[1]);
            else if (vec.trim().startsWith("-"))
                minus_desc.push(vec.split("-")[1]);
        }

        let val_pret=document.getElementById("inp-pret");

        let pret_select=[];

        for (let pret of val_pret){
            if(pret.selected){
                pret_select.push(pret.value);
            }
        }

        let pret_min=[];
        let pret_max=[];

        for (let pret of pret_select){
            pret_min.push(parseInt(pret.split('-')[0]));
            pret_max.push(parseInt(pret.split('-')[1]));
        }

        var produse = document.getElementsByClassName("produs");

        for (let prod of produse) {
            prod.style.display = "none";
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();

            let cond1 = (nume.includes(val_nume));

            let producatori = prod.getElementsByClassName("val-producator")[0].innerHTML;

            let cond2 = (producator === "toate" || producator === producatori);

            let puncte = parseFloat(prod.getElementsByClassName("val-puncte")[0].innerHTML);

            let cond3 = (puncte > var_puncte)

            let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;

            let cond4 = (val_categ === "toate" || val_categ === categorie)

            let material = prod.getElementsByClassName("val-material")[0].innerHTML;

            let cond5 = (val_material === "" || val_material === material)

            let colectie = prod.getElementsByClassName("val-colectie")[0].innerHTML;

            let cond6 = (val_colectie === colectie)

            let descriere = prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();

            let cond7=true;

            for (let plus of plus_desc) {
                cond7=false;
                if (descriere.includes(' '+plus) || descriere.includes(plus+' ')) {
                    cond7 = true;
                    break;
                }
            }

            for (let minus of minus_desc) {
                if (descriere.includes(' '+minus) || descriere.includes(minus+' ')) {
                    cond7 = false;
                    break;
                }
            }

            if(val_descriere==='')
                cond7=true;

            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);

            let cond8=false;

            for (let i=0; i<pret_min.length; i++)
            {
                if(pret_min[i]<=pret && pret<=pret_max[i]) {
                    cond8 = true;
                    break;
                }
            }

            if (pret_select.length===0)
                cond8=true;

            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8) {
                prod.style.display = "block";
            }
        }
    }

    document.getElementById("resetare").onclick = function () {

        if (confirm("Sigur vrei sa resetezi?")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("r_default").checked = true;
            document.getElementById("inp-pret").selectedIndex = -1;
            document.getElementById("inp-pret").options.selected = false;
            document.getElementById("inp-puncte").value = document.getElementById("inp-puncte").min;
            document.getElementById("infoRange").innerHTML = `(0)`;
            document.getElementById("inp-descriere").value = "";
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("inp-colectie").checked = false;
            document.getElementById("inp-material").value = "";

            var produse = document.getElementsByClassName("produs");

            for (let prod of produse) {
                prod.style.display = "block";
            }

            location.reload();
        }
    }

    function sortare(semn) {
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);
        v_produse.sort(function (a, b) {
            let pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a === pret_b) {
                let nume_a = a.getElementsByClassName("val-categorie")[0].innerHTML;
                let nume_b = b.getElementsByClassName("val-categorie")[0].innerHTML;
                return semn * nume_a.localeCompare(nume_b);
            }
            return semn * (pret_a - pret_b);
        });
        for (let prod of v_produse) {
            prod.parentElement.appendChild(prod);
        }
    }

    document.getElementById("sortCrescNume").onclick = function () {
        sortare(1);
    }
    document.getElementById("sortDescrescNume").onclick = function () {
        sortare(-1);
    }

    window.onkeydown = function (e) {
        if (e.key === "c" && e.altKey) {
            if (document.getElementById("info-suma"))
                return;
            var produse = document.getElementsByClassName("produs");
            let suma = 0;
            for (let prod of produse) {
                if (prod.style.display !== "none") {
                    let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML)
                    suma += pret;
                }
            }
            let p = document.createElement("p");
            p.innerHTML = suma;
            p.id = 'info-suma';
            ps = document.getElementById("p-suma");
            container = ps.parentNode;
            frate = ps.nextElementSibling;
            container.insertBefore(p, frate);
            setTimeout(function () {
                let info = document.getElementById("info-suma");
                if (info)
                    info.remove()
            }, 1000)
        }
    }

   document.getElementById("inp-colectie").onchange=function toggleButtonClass() {
       val_colectie = document.getElementById("inp-colectie");
        if (val_colectie.checked) {
            document.getElementById("label-colectie").classList.remove("btn-outline-secondary");
            document.getElementById("label-colectie").classList.add("btn-secondary");
        } else {
            document.getElementById("label-colectie").classList.remove("btn-secondary");
            document.getElementById("label-colectie").classList.add("btn-outline-secondary");
        }
    }
})
