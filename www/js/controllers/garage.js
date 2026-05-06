import { carService } from "../services/car.service.js";
import { auth } from "../services/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { db } from "../services/firebase.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

let removeDocId = null;
let shareDocId = null;

// Ensure Bootstrap is loaded
let bootstrapModalInitialized = false;
function initializeBootstrapIfNeeded() {
  if (!bootstrapModalInitialized && typeof bootstrap === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
    script.integrity = 'sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    bootstrapModalInitialized = true;
  }
}

function showShareModal(docId) {
  const modalEl = document.getElementById("shareModal");
  if (!modalEl) return alert("Share feature is unavailable. Please try again later.");
  
  shareDocId = docId;
  
  try {
    $('#shareModal').modal('show');
    return;
  } catch (err) {}
  
  try {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
      return;
    }
  } catch (err) {}
  
  modalEl.style.display = 'block';
  modalEl.classList.add('show');
  document.body.classList.add('modal-open');
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop show';
  document.body.appendChild(backdrop);
}

function hideModal() {
  try { $('#shareModal').modal('hide'); } catch(e) {}
  try {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modalEl = document.getElementById("shareModal");
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
    }
  } catch(e) {}
  
  const modal = document.getElementById("shareModal");
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
  }
}

$(document).ready(function () {
  initializeBootstrapIfNeeded();
  
  $("#garageRow").html('<div class="col-12 text-center my-5"><div class="spinner-border" role="status"></div><p class="mt-2">Loading vehicles...</p></div>');

  const msg = sessionStorage.getItem("carAddedMessage");
  if (msg) {
    $("#popupText").text(msg);
    $("#popupMessage").fadeIn();
    sessionStorage.removeItem("carAddedMessage");
    setTimeout(() => $("#popupMessage").fadeOut(), 4000);
  }
  $("#closePopup").on("click", () => $("#popupMessage").fadeOut());

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      $("#garageRow").html('<div class="col-12 text-center"><p>Please log in to view your garage</p></div>');
      return;
    }

    try {
      const ownDocs = await carService.getUserCars(user.uid);
      const sharedDocs = await carService.getSharedCars(user.uid);
      const allDocs = [...ownDocs, ...sharedDocs];
      const uniqueDocs = allDocs.filter((doc, index, self) => index === self.findIndex((d) => d.id === doc.id));
      
      const $row = $("#garageRow").empty();
      
      if (uniqueDocs.length === 0) {
        $row.html('<div class="col-12 text-center my-4"><p>No vehicles in your garage yet</p><a href="addcar.html" class="btn btn-dark">Add Your First Vehicle</a></div>');
        return;
      }

      const userEmailCache = {};
      
      for (const car of uniqueDocs) {
        try {
          const docId = car.id;
          const isOwner = car.userId === user.uid;
          const sharedWith = car.sharedWith || [];

          let ownerEmail = "You";
          if (!isOwner) {
            if (userEmailCache[car.userId]) {
              ownerEmail = userEmailCache[car.userId];
            } else {
              const ownerDoc = await getDoc(doc(db, "users", car.userId));
              if (ownerDoc.exists()) {
                ownerEmail = ownerDoc.data().email || "Unknown";
                userEmailCache[car.userId] = ownerEmail;
              }
            }
          }

          let ownerBadge = "";
          if (isOwner && sharedWith.length) {
            const names = await Promise.all(sharedWith.map(async uid => {
              if (userEmailCache[uid]) return userEmailCache[uid].split("@")[0];
              const uSnap = await getDoc(doc(db, "users", uid));
              if (uSnap.exists()) {
                const email = uSnap.data().email;
                userEmailCache[uid] = email;
                return email.split("@")[0];
              }
              return "unknown";
            }));
            ownerBadge = `<span class="badge bg-warning position-absolute owner-share-badge" style="bottom:10px; right:10px; color:#212529;">Sharing with ${names.join(", ")}</span>`;
          }

          const isShared = !isOwner && sharedWith.includes(user.uid);
          const otherBadge = isShared ? `<span class="badge bg-info position-absolute other-share-badge" style="top:10px; left:10px;">${car.userName || ownerEmail.split("@")[0]}'s car</span>` : "";

          const $col = $("<div>", { class: "col-6 mb-3" });
          const $card = $("<div>", { class: "card position-relative", css: { borderRadius: "15px" } });

          let imgSrc = "images/car.png";
          if (car.vehicleType === "moto") imgSrc = "images/motorbike.png";
          if (car.vehicleType === "truck") imgSrc = "images/truck.png";

          const menuHtml = `
            <div class="custom-dropdown" style="position:absolute; top:10px; right:10px;">
              <button class="custom-dropbtn" style="background:none;border:none;cursor:pointer;"><i class="fa-solid fa-ellipsis-vertical"></i></button>
              <div class="custom-dropdown-content">
                <a href="editcar.html?id=${docId}">Edit</a>
                <a href="#" class="share-car" data-docid="${docId}">Share</a>
                <a href="#" class="remove-car" data-docid="${docId}" style="color:red;">Remove</a>
              </div>
            </div>`;

          let ownershipText = isOwner ? 
            (sharedWith.length > 0 ? `<p class="card-text text-primary"><i class="fa-solid fa-share-nodes me-1"></i> Shared with ${sharedWith.length} user${sharedWith.length > 1 ? 's' : ''}</p>` : `<p class="card-text text-success"><i class="fa-solid fa-lock me-1"></i> Private vehicle</p>`) 
            : `<p class="card-text text-info"><i class="fa-solid fa-user me-1"></i> Owner: ${ownerEmail}</p>`;

          $card.html(`
            ${menuHtml}
            ${ownerBadge}
            ${otherBadge}
            <img src="${imgSrc}" class="card-img-top" alt="${car.vehicleType || 'vehicle'}" style="height:120px;object-fit:contain;padding:10px;">
            <div class="card-body text-start">
              <h5 class="card-title">${car.name || 'Unnamed Vehicle'}</h5>
              <p class="card-text">Plate: ${car.plate || 'Unknown'}</p>
              <p class="card-text">Brand: ${car.brand || 'Unknown'}</p>
              <p class="card-text">Model: ${car.model || 'Unknown'}</p>
              ${ownershipText}
            </div>`);
          $col.append($card);
          $row.append($col);

          $card.find(".custom-dropbtn").on("click", function(e) {
            e.stopPropagation();
            $(".custom-dropdown-content").hide();
            $(this).siblings(".custom-dropdown-content").toggle();
          });
        } catch (err) {}
      }
    } catch (err) {
      $("#garageRow").html(`<div class="col-12 text-center"><p>Error loading vehicles: ${err.message}</p><button id="retryBtn" class="btn btn-primary">Retry</button></div>`);
      $("#retryBtn").on("click", () => location.reload());
    }
  });

  $(document).on("click", () => $(".custom-dropdown-content").hide());

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
      await carService.deleteCar(removeDocId);
      $(`.remove-car[data-docid="${removeDocId}"]`).closest(".col-6").remove();
      if ($("#garageRow").children().length === 0) {
        $("#garageRow").html('<div class="col-12 text-center my-4"><p>No vehicles in your garage yet</p><a href="addcar.html" class="btn btn-primary">Add Your First Vehicle</a></div>');
      }
    } catch(err) {
      alert("Error removing vehicle.");
    }
    $("#confirmRemovePopup").fadeOut();
    removeDocId = null;
  });

  $(document).on("click", ".share-car", function(e) {
    e.preventDefault(); e.stopPropagation();
    showShareModal($(this).data("docid"));
    $(".custom-dropdown-content").hide();
  });

  $(document).on("click", ".btn-close, .modal-backdrop, button[data-bs-dismiss='modal']", hideModal);

  $("#shareForm").on("submit", async function(e) {
    e.preventDefault();
    const email = $("#shareEmail").val().trim().toLowerCase();
    if (!email) return alert("Please enter an email address");
    
    try {
      const userObj = await carService.getUserByEmail(email);
      if (!userObj) return alert("No user with that email");
      
      await carService.shareCar(shareDocId, userObj.id);

      const $card = $(`.share-car[data-docid="${shareDocId}"]`).closest(".card");
      $card.find(".owner-share-badge").remove();
      $card.append(`<span class="badge bg-warning position-absolute owner-share-badge" style="bottom:10px; right:10px; color:#212529;">Sharing with ${email.split("@")[0]}</span>`);
      
      const currentOwnershipText = $card.find(".card-body p.card-text:contains('Private vehicle'), .card-body p.card-text:contains('Shared with')");
      if (currentOwnershipText.length) {
        currentOwnershipText.html(`<i class="fa-solid fa-share-nodes me-1"></i> Shared with users`);
        currentOwnershipText.removeClass("text-success").addClass("text-primary");
      } else {
        $card.find(".card-body").append(`<p class="card-text text-primary"><i class="fa-solid fa-share-nodes me-1"></i> Shared with users</p>`);
      }
      alert("Car shared successfully!");
      hideModal();
    } catch(err) {
      alert("Failed to share car. Please try again.");
    }
    
    $("#shareEmail").val("");
    shareDocId = null;
  });
});