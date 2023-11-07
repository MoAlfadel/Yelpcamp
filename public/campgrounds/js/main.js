const menuBtn = document.getElementById("menuBtn");
const links = document.getElementById("links");
let flashBox = document.getElementById("flash");
let cancelFlashBtn = document.getElementById("cancelFlash");
let bodyContainer = document.getElementById("bodyContainer");
let navLinks = document.querySelectorAll("body:not(.home-page) header nav a ");

menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    links.classList.toggle("active");

    bodyContainer.classList.toggle("blur");
});

if (navLinks) {
    navLinks[+localStorage.activeIndex || 1].classList.add("active");
    navLinks.forEach((link, index) => {
        link.addEventListener("click", () => {
            navLinks.forEach((link) => link.classList.remove("active"));
            localStorage.activeIndex = index;

            navLinks[+localStorage.activeIndex].classList.add("active");
        });
    });
}
if (cancelFlashBtn)
    cancelFlashBtn.addEventListener("click", () => {
        flashBox.style.display = "none";
    });

let fileInput = document.getElementById("file-upload-input");
let fileSelect = document.getElementById("file-select");

if (fileSelect)
    fileSelect.addEventListener("click", () => {
        fileInput.click();
    });
if (fileInput)
    fileInput.onchange = function () {
        let filename = fileInput.files.length;
        let selectName = document.getElementsByClassName("file-select-name")[0];
        selectName.innerText = `${filename} Files Chosen`;
    };
// --------------------
