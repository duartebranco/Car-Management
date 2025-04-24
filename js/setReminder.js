import { auth, db } from "./firebase.js";
import { collection, getDocs, query, where, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const ownQ    = query(collection(db, "cars"), where("userId",      "==",              user.uid));
    const sharedQ = query(collection(db, "cars"), where("sharedWith","array-contains", user.uid));
    const [ownSnap, sharedSnap] = await Promise.all([ getDocs(ownQ), getDocs(sharedQ) ]);
    const docs     = [...ownSnap.docs, ...sharedSnap.docs];
    const unique   = Array.from(new Map(docs.map(d=>[d.id,d])).values());

    const carSelect = document.getElementById("carSelect");
    carSelect.innerHTML = "<option value='' disabled selected>Select a car</option>";
    unique.forEach(docSnap => {
        const car = docSnap.data();
        const opt = document.createElement("option");
        opt.value = docSnap.id;
        opt.textContent = car.name;
        carSelect.appendChild(opt);
    });
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
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        // bootstrap validation
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }
        submitBtn.disabled = true;

        // Gather reminder data
        const type = typeSelect.value === "other" ? otherTypeInput.value : typeSelect.value;
        const carId = document.getElementById("carSelect").value;
        const numKm = document.getElementById("numKm").value;
        const reminderDate = document.getElementById("reminderDate").value;

        // Get user
        const user = auth.currentUser;

        // Save to Firestore
        try {
            await addDoc(collection(db, "reminders"), {
                userId: user.uid,
                carId,
                type,
                numKm: numKm || null,
                reminderDate,
                createdAt: new Date()
            });
        } catch (err) {
            alert("Failed to save reminder.");
            submitBtn.disabled = false;
            return;
        }

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

