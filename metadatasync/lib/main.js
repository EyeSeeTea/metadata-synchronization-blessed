"use strict";
//goToPageLanguageOnLoad()
document.addEventListener("DOMContentLoaded", function () {
    //console.log('Hello Bulma!');
});

function goToPageLanguageOnLoad() {
    const savedLang = getCookie("lang");
    console.log(savedLang);
    if (savedLang.length === 2) changeLanguage(savedLang);
}

function changeLanguage(code) {
    const basepath = getPathNameBase();
    if (code === "es") location.pathname = basepath + "index_es.html";
    else if (code === "fr") location.pathname = basepath + "index_fr.html";
    else location.pathname = basepath + "index.html";
    setCookie("lang", code, 365);
}

function getPathNameBase() {
    let pathArray = window.location.pathname.split("/");
    pathArray.pop();
    var pathname = "";
    for (let i = 0; i < pathArray.length; i++) {
        pathname += "/";
        pathname += pathArray[i];
    }
    if (pathname.charAt(pathname.length - 1) !== "/") pathname += "/";
    pathname = pathname.replace(/\/\//g, "/");
    return pathname;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
