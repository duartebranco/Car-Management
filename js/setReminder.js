import { auth, db } from "./firebase.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const carsQuery = query(
        collection(db, "cars"),
        where("userId", "==", user.uid)
    );
    const snapshot = await getDocs(carsQuery);
    const carSelect = document.getElementById("carSelect");
    carSelect.innerHTML = "<option value='' disabled selected>Select a car</option>";

    snapshot.forEach((doc) => {
        const car = doc.data();
        const opt = document.createElement("option");
        opt.value = doc.id;
        opt.textContent = `${car.name}`;
        carSelect.appendChild(opt);
    });

    if (snapshot.empty) {
        carSelect.innerHTML = "<option value='' disabled>No cars found</option>";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const typeSelect = document.getElementById("typeSelect");
    const otherTypeInput = document.getElementById("otherTypeInput");
    const form = document.getElementById("reminderForm");
    const submitBtn = form.querySelector('button[type="submit"]');

    new Pikaday({
        field: document.getElementById('reminderDate'),
        minDate: new Date(),
        format: 'YYYY-MM-DD'
    });

    // show/hide “other” input
    typeSelect.addEventListener("change", () => {
        if (typeSelect.value === "other") {
            otherTypeInput.style.display = "block";
            otherTypeInput.required = true;
        } else {
            otherTypeInput.style.display = "none";
            otherTypeInput.required = false;
            otherTypeInput.value = "";
        }
    });

    // form submit + redirect
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        // bootstrap validation
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }
        // now it’s valid → disable button + show toast + redirect
        submitBtn.disabled = true;
        const toastEl = document.getElementById("successToast");
        const bsToast = new bootstrap.Toast(toastEl);
        bsToast.show();
        toastEl.addEventListener(
            "hidden.bs.toast",
            () => (window.location.href = "index.html"),
            { once: true }
        );
    });
  });

