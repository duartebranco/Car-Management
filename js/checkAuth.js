import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { auth } from "./firebase.js";

// Wait for Firebase to determine auth state before showing the page
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.body.style.display = "";
    } else {
        window.location.href = 'auth.html';
    }
});