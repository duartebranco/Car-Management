import { auth } from "../services/firebase.js";
import { carService } from "../services/car.service.js";

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
    try {
        const car = await carService.getCarById(docId);
        if (!car) {
            alert("Vehicle not found.");
            window.location.href = "garage.html";
            return;
        }

        $("#vehicleType").val(car.vehicleType);
        $("#name").val(car.name);
        $("#plate").val(car.plate);
        $("#brand").val(car.brand);
        $("#model").val(car.model);
        $("#kms").val(car.kms || "");
        $("#year").val(car.year || "");
    } catch (err) {
        console.error("Error loading car:", err);
        alert("Failed to load vehicle.");
        window.location.href = "garage.html";
        return;
    }

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
            await carService.updateCar(docId, updatedCar);
            sessionStorage.setItem("carAddedMessage", `You've updated ${updatedCar.name}`);
            window.location.href = "garage.html";
        } catch (error) {
            alert("Error updating vehicle.");
            console.error(error);
        }
    });
});