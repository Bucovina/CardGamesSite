let darktheme = localStorage.getItem("darktheme");
let vaporeontheme =localStorage.getItem("vaporeontheme")

if (darktheme) {
    document.body.classList.add("dark");
}
if (vaporeontheme){
    document.body.classList.add("vapor")
}
window.addEventListener("load", function () {
    document.getElementById("darktheme").onclick = function () {
        if (document.body.classList.contains("vapor")){
            document.body.classList.remove("vapor")
            localStorage.removeItem("vaporeontheme");
            document.body.classList.add("dark")
            localStorage.setItem("darktheme", "dark");
        }
        else{
            document.body.classList.add("dark")
            localStorage.setItem("darktheme", "dark");
        }
    }

    document.getElementById("vaporeontheme").onclick = function () {
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark")
            localStorage.removeItem("darktheme");
            document.body.classList.add("vapor")
            localStorage.setItem("vaporeontheme", "vapor");
        }
        else {
            document.body.classList.add("vapor")
            localStorage.setItem("vaporeontheme", "vapor");
        }
    }

    document.getElementById("normaltheme").onclick = function () {
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark")
            localStorage.removeItem("darktheme");
        }
        else if (document.body.classList.contains("vapor")){
            document.body.classList.remove("vapor")
            localStorage.removeItem("vaporeontheme");
        }
    }
})
