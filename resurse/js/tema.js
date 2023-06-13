let darktheme = localStorage.getItem("darktheme");
let vaporeontheme =localStorage.getItem("vaporeontheme")
if (darktheme) {
    document.body.classList.add("dark");
}
if (vaporeontheme){
    document.body.classList.add("vaporeon")
}
window.addEventListener("load", function () {
    document.getElementById("darktheme").onclick = function () {
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark")
            localStorage.removeItem("darktheme");
        } else if (document.body.classList.contains("vaporeon")){
            document.body.classList.remove("va")
        }
        else {
            document.body.classList.add("dark")
            localStorage.setItem("darktheme", "dark");
        }
    }
})
