import { db, auth } from "./firebase.js";
import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

$(document).ready(async function() {
    const docId = getQueryParam("id");
    if (!docId) {
        alert("No vehicle selected for editing.");
        window.location.href = "garage.html";
        return;
    }

    // Fetch car data
    const docRef = doc(db, "cars", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        alert("Vehicle not found.");
        window.location.href = "garage.html";
        return;
    }

    const car = docSnap.data();
    $("#vehicleType").val(car.vehicleType);
    $("#name").val(car.name);
    $("#plate").val(car.plate);
    $("#brand").val(car.brand);
    $("#model").val(car.model);
    $("#kms").val(car.kms || "");
    $("#year").val(car.year || "");

    // Handle form submit
    $("#editCarForm").on("submit", async function(e) {
        e.preventDefault();

        const updatedCar = {
            vehicleType: $("#vehicleType").val(),
            name: $("#name").val(),
            plate: $("#plate").val(),
            brand: $("#brand").val(),
            model: $("#model").val(),
            kms: $("#kms").val() || null,
            year: $("#year").val() || null
        };

        try {
            await updateDoc(docRef, updatedCar);
            sessionStorage.setItem("carAddedMessage", `You've updated ${updatedCar.name}`);
            window.location.href = "garage.html";
        } catch (error) {
            alert("Error updating vehicle.");
            console.error(error);
        }
    });
});