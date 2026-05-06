import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export const carService = {
  async getUserCars(userId) {
    const q = query(collection(db, "cars"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  
  async getSharedCars(userId) {
    const q = query(collection(db, "cars"), where("sharedWith", "array-contains", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getCarById(carId) {
    const d = await getDoc(doc(db, "cars", carId));
    if (!d.exists()) return null;
    return { id: d.id, ...d.data() };
  },

  async updateCar(carId, data) {
    await updateDoc(doc(db, "cars", carId), data);
  },

  async deleteCar(carId) {
    await deleteDoc(doc(db, "cars", carId));
  },

  async shareCar(carId, otherUid) {
    await updateDoc(doc(db, "cars", carId), {
      sharedWith: arrayUnion(otherUid)
    });
  },

  async getUserByEmail(email) {
    const usersQ = query(collection(db, "users"), where("email", "==", email));
    const usersSnap = await getDocs(usersQ);
    if (usersSnap.empty) return null;
    return { id: usersSnap.docs[0].id, ...usersSnap.docs[0].data() };
  }
};