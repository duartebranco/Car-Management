// filepath: c:\Users\ACER\Desktop\Pastas\Uni\2ºAno\2º Semestre\IHC\Car-Management\js\addcar.js
import { db, auth } from "./firebase.js";
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

$(document).ready(function() {
    let carDataArray = [];
    let currentUserId = null;
    const brandSelect = $("#brand");
    const modelSelect = $("#model");
    const brandFilterInput = $("#brandFilter");
    const modelFilterInput = $("#modelFilter");

    // --- Check Auth State ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
            fetchAndProcessCarData();
        } else {
            console.log("User not logged in, redirecting...");
            alert("Please log in first!");
            window.location.href = "auth.html";
        }
    });

    // --- Fetch JSON and Process Data ---
    function fetchAndProcessCarData() {
        $.getJSON("data/vehicles.json", function(data) {
            console.log("Car data array loaded successfully.");
            carDataArray = data;
            populateBrands();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Could not fetch car data:", textStatus, errorThrown);
            alert("Error loading car brands and models. Please try refreshing the page.");
            brandSelect.prop('disabled', true);
            modelSelect.prop('disabled', true);
            brandFilterInput.prop('disabled', true); // Disable filter if load fails
            modelFilterInput.prop('disabled', true); // Disable filter if load fails
        });
    }

    // --- Populate Brand Select ---
    function populateBrands() {
        brandSelect.empty().append('<option value="" disabled selected>Select Brand</option>');
        const uniqueMakes = new Set(carDataArray.map(car => car.make));
        const sortedMakes = [...uniqueMakes].sort();

        $.each(sortedMakes, function(index, make) {
            brandSelect.append($('<option>', { value: make, text: make }));
        });

        brandSelect.prop('disabled', false);
        brandFilterInput.prop('disabled', false); // Enable brand filter
        modelSelect.prop('disabled', true).empty().append('<option value="" disabled selected>Select Model</option>'); // Reset model select
        modelFilterInput.prop('disabled', true).val(''); // Disable and clear model filter
        filterOptions(brandFilterInput, brandSelect); // Apply initial filter if any text exists
    }

    // --- Handle Brand Change ---
    brandSelect.on("change", function() {
        const selectedMake = $(this).val();
        modelSelect.empty().append('<option value="" disabled selected>Select Model</option>');
        modelFilterInput.val(''); // Clear model filter on brand change

        if (selectedMake) {
            const carsOfMake = carDataArray.filter(car => car.make === selectedMake);
            const uniqueModels = new Set(carsOfMake.map(car => car.model));
            const sortedModels = [...uniqueModels].sort();

            $.each(sortedModels, function(index, model) {
                modelSelect.append($('<option>', { value: model, text: model }));
            });
            modelSelect.prop('disabled', false);
            modelFilterInput.prop('disabled', false); // Enable model filter
            filterOptions(modelFilterInput, modelSelect); // Apply initial filter if any text exists
        } else {
            modelSelect.prop('disabled', true);
            modelFilterInput.prop('disabled', true); // Disable model filter if no brand
        }
    });

    // --- Filter Function ---
    function filterOptions(filterInput, selectElement) {
        const filterValue = filterInput.val().toLowerCase();
        selectElement.find('option').each(function() {
            const option = $(this);
            const optionText = option.text().toLowerCase();
            // Always show the placeholder/disabled option
            if (option.is(':disabled')) {
                option.show();
            } else {
                option.toggle(optionText.includes(filterValue));
            }
        });
        // Ensure the selected value remains visible if it matches the filter
        const selectedOption = selectElement.find('option:selected');
        if (selectedOption.length && selectedOption.css('display') === 'none') {
             // If current selection is hidden by filter, reset selection to placeholder
             selectElement.val('');
        }
    }

    // --- Event Listeners for Filter Inputs ---
    brandFilterInput.on('input', function() {
        filterOptions($(this), brandSelect);
    });

    modelFilterInput.on('input', function() {
        filterOptions($(this), modelSelect);
    });


    // --- Form Submission ---
    $("#addCarForm").on("submit", async function(e) {
        e.preventDefault();

        if (!currentUserId) {
            alert("Authentication error. Please log in again.");
            return;
        }

        // --- Input Validation ---
        const plateInput = $("#plate");
        const plateValue = plateInput.val().trim();
        const platePattern = /^[A-Za-z0-9]{2}-[A-Za-z0-9]{2}-[A-Za-z0-9]{2}$/;

        if (!platePattern.test(plateValue)) {
             alert("Please enter a valid plate number in the format XX-XX-XX (e.g., AA-00-BB).");
             plateInput.focus();
             return;
        }
        if (!brandSelect.val()) { // Use brandSelect jQuery object
            alert("Please select a vehicle brand.");
            brandSelect.focus(); // Focus the select element
            return;
        }
         if (!modelSelect.val() || modelSelect.is(':disabled')) { // Use modelSelect jQuery object
            alert("Please select a vehicle model.");
            modelSelect.focus(); // Focus the select element
            return;
        }

        // Gather form data using jQuery
        const vehicleData = {
            userId: currentUserId,
            vehicleType: $("#vehicleType").val(),
            name: $("#name").val().trim(),
            plate: plateValue.toUpperCase(),
            brand: brandSelect.val(), // Use brandSelect jQuery object
            model: modelSelect.val(), // Use modelSelect jQuery object
            kms: $("#kms").val() ? parseInt($("#kms").val(), 10) : null,
            year: $("#year").val() ? parseInt($("#year").val(), 10) : null,
            createdAt: serverTimestamp()
        };

        const submitButton = $(this).find('button[type="submit"]');
        submitButton.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Adding...'); // Add spinner

        try {
            // Changed collection name to 'cars' to match garage.js
            const docRef = await addDoc(collection(db, "cars"), vehicleData);
            console.log("Vehicle added with ID:", docRef.id);
            sessionStorage.setItem("carAddedMessage", `You've added ${vehicleData.name} to your garage`);
            window.location.href = "garage.html";
        } catch (error) {
            console.error("Error adding vehicle:", error);
            alert("Failed to add vehicle. Please try again.");
            submitButton.prop('disabled', false).html('<i class="fa-solid fa-plus"></i> Add'); // Restore button text
        }
    });
});