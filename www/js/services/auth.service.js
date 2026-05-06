import { 
    onAuthStateChanged, 
    signOut, 
    sendPasswordResetEmail, 
    deleteUser 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { auth } from "./firebase.js";

// Wait for Firebase to determine auth state before showing the page
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.body.style.display = "";
    } else {
        const isRoot = !window.location.pathname.includes('/pages/');
        window.location.href = isRoot ? "pages/auth.html" : "auth.html";
    }
});

export const authService = {
    async logout() {
        await signOut(auth);
    },
    
    async resetPassword(email) {
        await sendPasswordResetEmail(auth, email);
    },
    
    async deleteAccount(user) {
        await deleteUser(user);
    },
    
    getCurrentUser() {
        return auth.currentUser;
    }
};