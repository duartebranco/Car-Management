import { db, auth } from "./firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

$(document).ready(function(){
    $("#addCarForm").on("submit", async function(e) {
        e.preventDefault();
        
        // Ensure the user is logged in
        const user = auth.currentUser;
        if (!user) {
            alert("Please log in first!");
            return;
        }
        
        // Gather form data using jQuery
        const carData = {
            userId: user.uid,
            userName: user.displayName || user.email,
            vehicleType: $("#vehicleType").val(),
            name: $("#name").val(),
            plate: $("#plate").val(),
            brand: $("#brand").val(),
            model: $("#model").val(),
            kms: $("#kms").val() || null,
            year: $("#year").val() || null,
            createdAt: new Date()
        };

        try {
            const docRef = await addDoc(collection(db, "cars"), carData);
            console.log("Car added with ID:", docRef.id);
            // Store message in sessionStorage
            sessionStorage.setItem("carAddedMessage", `You've added ${carData.name} to your garage`);
            window.location.href = "garage.html"; // Redireciona após adicionar
            // Optionally: Redirect to the garage page or show a success message
        } catch (error) {
            console.error("Error adding car:", error);
        }
    });
});