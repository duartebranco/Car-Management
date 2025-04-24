import { auth, db } from "./firebase.js";
import { collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const remindersQuery = query(collection(db, "reminders"), where("userId", "==", user.uid));
    const snapshot = await getDocs(remindersQuery);
    const remindersList = document.getElementById("remindersList");
    remindersList.innerHTML = "";

    if (snapshot.empty) {
        remindersList.innerHTML = "<li class='list-group-item'>No reminders found.</li>";
        return;
    }

    for (const docSnap of snapshot.docs) {
        const reminder = docSnap.data();
        let carName = "";
        let imgSrc = "images/car.png";

        // Format the reminderDate based on its type
        let formattedDate = "Unknown Date";
        if (reminder.reminderDate) {
            if (reminder.reminderDate.toDate) {
                // Firestore Timestamp: Convert to JS Date
                const dateObj = reminder.reminderDate.toDate();
                formattedDate = dateObj.toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } else if (typeof reminder.reminderDate === "string") {
                // Already a readable string
                formattedDate = reminder.reminderDate;
            }
        }

        if (reminder.carId) {
            const carDoc = await getDoc(doc(db, "cars", reminder.carId));
            if (carDoc.exists()) {
                const car = carDoc.data();
                carName = car.name || "";
                if (car.vehicleType === "moto") imgSrc = "images/motorbike.png";
                else if (car.vehicleType === "truck") imgSrc = "images/truck.png";
            }
        }

        const li = document.createElement("li");
        li.className = "list-group-item d-flex align-items-center justify-content-between";
        li.innerHTML = `
            <div class="d-flex align-items-center" style="min-width:0;">
                <img src="${imgSrc}" alt="car" style="width:48px;height:48px;object-fit:contain;margin-right:16px;">
                <div style="min-width:0;">
                    <div style="font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${reminder.type}</div>
                    <div style="font-size:0.95em;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${carName || "Unknown Car"}</div>
                </div>
            </div>
            <div style="white-space:nowrap;font-size:0.95em;font-weight:bold;">${formattedDate}</div>
        `;
        remindersList.appendChild(li);
    }
});