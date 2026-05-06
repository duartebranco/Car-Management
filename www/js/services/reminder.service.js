import { db } from "./firebase.js";
import { collection, getDocs, query, where, deleteDoc, doc, addDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export const reminderService = {
  async getUserReminders(userId) {
    const q = query(collection(db, "reminders"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  
  async getSharedReminders(carIds) {
    if (!carIds || carIds.length === 0) return [];
    // Firestore max 'in' clause is 10, batching if needed
    const batches = [];
    for (let i = 0; i < carIds.length; i += 10) {
      const batch = carIds.slice(i, i + 10);
      const q = query(collection(db, "reminders"), where("carId", "in", batch));
      batches.push(getDocs(q));
    }
    
    const results = await Promise.all(batches);
    const docs = [];
    results.forEach(snap => {
      snap.docs.forEach(d => docs.push({ id: d.id, ...d.data() }));
    });
    
    // De-dupe
    return docs.filter((doc, index, self) => index === self.findIndex(d => d.id === doc.id));
  },

  async deleteReminder(reminderId) {
    await deleteDoc(doc(db, "reminders", reminderId));
  },

  async addReminder(data) {
    return await addDoc(collection(db, "reminders"), data);
  }
};