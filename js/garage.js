import { db, auth } from "./firebase.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

$(document).ready(function(){
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.log("User not logged in.");
            return; // Optionally, redirect to the auth page here
        }
        
        // Query for cars matching the user's UID
        const q = query(collection(db, "cars"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const $row = $("#garageRow");
        querySnapshot.forEach((doc) => {
            const car = doc.data();
            const $col = $('<div>', { class: "col-6 mb-3" });
            const $card = $('<div>', { class: "card", css: { borderRadius: "15px" } });
            
            const cardInnerHtml = `
                <div class="card-body text-start">
                    <h5 class="card-title">${car.name}</h5>
                    <p class="card-text">Type: ${car.vehicleType}</p>
                    <p class="card-text">Plate: ${car.plate}</p>
                    <p class="card-text">Brand: ${car.brand}</p>
                    <p class="card-text">Model: ${car.model}</p>
                    ${car.kms ? `<p class="card-text">Kms: ${car.kms}</p>` : ""}
                    ${car.year ? `<p class="card-text">Year: ${car.year}</p>` : ""}
                </div>
            `;
            $card.html(cardInnerHtml);
            $col.append($card);
            $row.append($col);
        });
    });
});