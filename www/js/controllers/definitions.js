import { auth } from "../services/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { authService } from "../services/auth.service.js";

let customPopupTimeout = null;
function showCustomPopup(message) {
    const popup = document.getElementById("customPopup");
    document.getElementById("customPopupText").textContent = message;
    popup.style.display = "block";
    // Auto-dismiss after 2.5 seconds
    if (customPopupTimeout) clearTimeout(customPopupTimeout);
    customPopupTimeout = setTimeout(hideCustomPopup, 2500);
}
function hideCustomPopup() {
    document.getElementById("customPopup").style.display = "none";
    if (customPopupTimeout) clearTimeout(customPopupTimeout);
}
document.getElementById("closeCustomPopup").onclick = hideCustomPopup;
document.getElementById("customPopup").onclick = hideCustomPopup;

// Confirm delete popup logic
const confirmDeletePopup = document.getElementById("confirmDeletePopup");
document.getElementById("deleteAccountBtn").onclick = () => {
    confirmDeletePopup.style.display = "block";
};
document.getElementById("cancelDeleteBtn").onclick = () => {
    confirmDeletePopup.style.display = "none";
};
document.getElementById("confirmDeleteBtn").onclick = async () => {
    confirmDeletePopup.style.display = "none";
    try {
        await authService.deleteAccount(authService.getCurrentUser());
        showCustomPopup("Account deleted.");
        setTimeout(() => window.location.href = "auth.html", 1200);
    } catch (err) {
        showCustomPopup("Failed to delete account. You may need to re-authenticate.");
    }
};

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "auth.html";
        return;
    }
    document.getElementById("userEmail").textContent = user.email;
});

document.getElementById("changePasswordBtn").onclick = async () => {
    const user = authService.getCurrentUser();
    if (user) {
        await authService.resetPassword(user.email);
        showCustomPopup("Password reset email sent.");
    }
};

document.getElementById("logoutBtn").onclick = async () => {
    await authService.logout();
    window.location.href = "auth.html";
};