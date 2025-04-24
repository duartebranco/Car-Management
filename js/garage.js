import "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc as firestoreDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  doc as userDocRef
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

let removeDocId = null;
let shareDocId  = null;

$(document).ready(function () {
  // popup on car added
  const msg = sessionStorage.getItem("carAddedMessage");
  if (msg) {
    $("#popupText").text(msg);
    $("#popupMessage").fadeIn();
    sessionStorage.removeItem("carAddedMessage");
  }
  $("#closePopup").on("click", () => $("#popupMessage").fadeOut());

  onAuthStateChanged(auth, async (user) => {
    if (!user) return console.log("Not logged in");

    // fetch own + shared cars
    const ownQ    = query(collection(db, "cars"), where("userId",      "==", user.uid));
    const sharedQ = query(collection(db, "cars"), where("sharedWith", "array-contains", user.uid));
    const [ownSnap, sharedSnap] = await Promise.all([getDocs(ownQ), getDocs(sharedQ)]);
    const allDocs   = [...ownSnap.docs, ...sharedSnap.docs];
    const uniqueDocs = Array.from(new Map(allDocs.map(d => [d.id,d])).values());

    const $row = $("#garageRow").empty();

    for (const docSnap of uniqueDocs) {
      const car         = docSnap.data();
      const docId       = docSnap.id;
      const isOwner     = car.userId === user.uid;
      const sharedWith  = Array.isArray(car.sharedWith) ? car.sharedWith : [];

      // owner badge (lists emails of recipients)
      let ownerBadge = "";
      if (isOwner && sharedWith.length) {
        const names = await Promise.all(sharedWith.map(async uid => {
          const uSnap = await getDoc(userDocRef(db,"users",uid));
          return uSnap.exists() ? uSnap.data().email.split("@")[0] : "unknown";
        }));
        ownerBadge = `
          <span class="badge bg-warning position-absolute owner-share-badge"
                style="bottom:10px; right:10px; color:#212529;">
            Sharing with ${names.join(", ")}
          </span>`;
      }

      // recipient badge
      const isShared = !isOwner && sharedWith.includes(user.uid);
      const otherBadge = isShared
        ? `<span class="badge bg-info position-absolute other-share-badge"
                 style="top:10px; left:10px;">
             ${car.userName || "Owner"}'s car
           </span>`
        : "";

      // build card
      const $col = $("<div>", { class: "col-6 mb-3" });
      const $card = $("<div>", {
        class: "card position-relative",
        css: { borderRadius: "15px" }
      });

      let imgSrc = "images/car.png";
      if (car.vehicleType==="moto")  imgSrc="images/motorbike.png";
      if (car.vehicleType==="truck") imgSrc="images/truck.png";

      const menuHtml = `
        <div class="custom-dropdown" style="position:absolute; top:10px; right:10px;">
          <button class="custom-dropbtn" style="background:none;border:none;cursor:pointer;">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <div class="custom-dropdown-content">
            <a href="editcar.html?id=${docId}">Edit</a>
            <a href="#" class="share-car" data-docid="${docId}">Share</a>
            <a href="#" class="remove-car" data-docid="${docId}" style="color:red;">Remove</a>
          </div>
        </div>`;

      const cardInner = `
        ${menuHtml}
        ${ownerBadge}
        ${otherBadge}
        <img src="${imgSrc}" class="card-img-top" alt="${car.vehicleType}"
             style="height:120px;object-fit:contain;padding:10px;">
        <div class="card-body text-start">
          <h5 class="card-title">${car.name}</h5>
          <p class="card-text">Plate: ${car.plate}</p>
          <p class="card-text">Brand: ${car.brand}</p>
          <p class="card-text">Model: ${car.model}</p>
        </div>`;

      $card.html(cardInner);
      $col.append($card);
      $row.append($col);

      $card.find(".custom-dropbtn").on("click", function(e) {
        e.stopPropagation();
        $(".custom-dropdown-content").hide();
        $(this).siblings(".custom-dropdown-content").toggle();
      });
    }
  });

  // global hide dropdown
  $(document).on("click", () => $(".custom-dropdown-content").hide());

  // Remove handlers
  $(document).on("click", ".remove-car", function(e) {
    e.preventDefault(); e.stopPropagation();
    removeDocId = $(this).data("docid");
    $("#confirmRemovePopup").fadeIn();
    $(".custom-dropdown-content").hide();
  });
  $("#cancelRemoveBtn").on("click", () => {
    $("#confirmRemovePopup").fadeOut();
    removeDocId = null;
  });
  $("#confirmRemoveBtn").on("click", async () => {
    if (!removeDocId) return;
    try {
      await deleteDoc(firestoreDoc(db,"cars",removeDocId));
      $(`.remove-car[data-docid="${removeDocId}"]`).closest(".col-6").remove();
    } catch(err) {
      alert("Erro ao remover veículo.");
      console.error(err);
    }
    $("#confirmRemovePopup").fadeOut();
    removeDocId = null;
  });

  // Open Share Modal
  $(document).on("click", ".share-car", function(e) {
    e.preventDefault(); e.stopPropagation();
    shareDocId = $(this).data("docid");
    const modalEl = document.getElementById("shareModal");
    new bootstrap.Modal(modalEl).show();
    $(".custom-dropdown-content").hide();
  });

  // Handle Share Form
  $("#shareForm").on("submit", async function(e) {
    e.preventDefault();
    const email = $("#shareEmail").val().trim().toLowerCase();
    try {
      // find user
      const usersQ    = query(collection(db,"users"), where("email","==",email));
      const usersSnap = await getDocs(usersQ);
      if (usersSnap.empty) {
        alert("No user with that email");
        return;
      }
      const otherUid = usersSnap.docs[0].id;

      // update car
      await updateDoc(
        firestoreDoc(db,"cars",shareDocId),
        { sharedWith: arrayUnion(otherUid) }
      );

      // update owner badge immediately
      const $card = $(`.share-car[data-docid="${shareDocId}"]`)
        .closest(".card");
      $card.find(".owner-share-badge").remove();
      $card.append(`
        <span class="badge bg-warning position-absolute owner-share-badge"
              style="bottom:10px; right:10px; color:#212529;">
          Sharing with ${email}
        </span>
      `);
      alert("Car shared!");
    } catch(err) {
      console.error(err);
      alert("Failed to share.");
    }

    const mEl = document.getElementById("shareModal");
    bootstrap.Modal.getInstance(mEl).hide();
    $("#shareEmail").val("");
    shareDocId = null;
  });
});