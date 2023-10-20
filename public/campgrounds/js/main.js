const menuBtn = document.getElementById("menuBtn");
const links = document.getElementById("links");
let flashBox = document.getElementById("flash");
let cancelFlashBtn = document.getElementById("cancelFlash");

menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    links.classList.toggle("active");
});

cancelFlashBtn.addEventListener("click", () => {
    flashBox.style.display = "none";
});
