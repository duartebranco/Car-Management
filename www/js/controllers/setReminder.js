import { auth } from "../services/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { carService } from "../services/car.service.js";
import { reminderService } from "../services/reminder.service.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    
    try {
        const ownCars = await carService.getUserCars(user.uid);
        const sharedCars = await carService.getSharedCars(user.uid);
        const docs = [...ownCars, ...sharedCars];
        const unique = Array.from(new Map(docs.map(d => [d.id, d])).values());

        const carSelect = document.getElementById("carSelect");
        carSelect.innerHTML = "<option value='' disabled selected>Select a car</option>";
        unique.forEach(car => {
            const opt = document.createElement("option");
            opt.value = car.id;
            opt.textContent = car.name || car.plate || "Unnamed";
            carSelect.appendChild(opt);
        });
    } catch (err) {
        console.error("Error loading cars for reminder:", err);
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
        const title = type;
        const carId = document.getElementById("carSelect").value;
        const numKm = document.getElementById("numKm").value;
        const reminderDate = document.getElementById("reminderDate").value;

        // Get user
        const user = auth.currentUser;

        // Save to Firestore
        try {
            await reminderService.addReminder({
                userId: user.uid,
                carId,
                type,
                title,
                numKm: numKm || null,
                reminderDate,
                createdAt: new Date()
            });

            // Schedule a native / web notification for the reminder date
            if (reminderDate && window.CarNotifications) {
                const notifDate = new Date(reminderDate + "T09:00:00");
                const carSelect = document.getElementById("carSelect");
                const carName = carSelect.options[carSelect.selectedIndex]?.text || "your vehicle";
                await window.CarNotifications.schedule(
                    `Reminder: ${title}`,
                    `Time to handle ${title} for ${carName}.`,
                    notifDate
                );
            }
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
            () => (window.location.href = "../index.html"),
            { once: true }
        );
    });
  });

