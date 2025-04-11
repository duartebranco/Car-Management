import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { auth } from "./firebase.js";

$(document).ready(function(){
    // Check if the user is authenticated
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'auth.html';
        }
    });
});