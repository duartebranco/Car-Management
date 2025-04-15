import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { auth } from "./firebase.js";

$(document).ready(function(){
    // Hide page content until the auth state is confirmed
    // Add a full-page spinner overlay
    const spinnerOverlay = $(`
        <div id="spinner-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);
    $("body").append(spinnerOverlay);


    // Check if the user is authenticated
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'auth.html';
        } else {
            // User is authenticated, show the page content
            $("#spinner-overlay").remove();
        }
    });
});