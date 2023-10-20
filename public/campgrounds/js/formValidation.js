const form = document.getElementById("form");
const fieldBoxes = document.querySelectorAll(".field");

// submit validation
form.addEventListener("submit", function (e) {
    fieldBoxes.forEach((field) => {
        field.classList.remove("success", "fail");
    });
    if (!validForm(fieldBoxes)) {
        e.preventDefault();
    }
});

// typing validation
fieldBoxes.forEach((field) => {
    let input = field.querySelector("input") ?? field.querySelector("textarea");
    input.addEventListener("input", () => {
        field.classList.remove("success", "fail");
        isValidField(field);
    });
});

function validForm(fieldBoxes) {
    let allValid = true;
    fieldBoxes.forEach((field) => {
        if (!isValidField(field)) {
            allValid = false;
        }
    });
    return allValid;
}

function isValidField(field) {
    let input = field.querySelector("input") ?? field.querySelector("textarea");
    let smallDisplay = field.querySelector("small");
    let label = field.querySelector("label");
    let valid = true;
    if (isEmpty(input.value)) {
        valid = false;
        smallDisplay.textContent = `${label.textContent} can not be blank`;
        field.classList.add("fail");
    } else if (
        field.classList.contains("priceField") &&
        !isPositive(input.value)
    ) {
        valid = false;
        smallDisplay.textContent = `Price  can not  min than 0 `;
        field.classList.add("fail");
    } else {
        smallDisplay.textContent = "it is look good";
        field.classList.add("success");
    }
    return valid;
}

let isEmpty = (value) => (value === "" ? true : false);
let isPositive = (number) => (number >= 0 ? true : false);
