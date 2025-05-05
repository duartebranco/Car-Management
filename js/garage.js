import { db, auth } from "./firebase.js";
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
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

let removeDocId = null;
let shareDocId = null;

// Ensure Bootstrap is loaded
let bootstrapModalInitialized = false;
function initializeBootstrapIfNeeded() {
  if (!bootstrapModalInitialized && typeof bootstrap === 'undefined') {
    console.log("Bootstrap not detected. Loading dynamically...");
    // Load Bootstrap JS if not available
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
  if (!modalEl) {
    console.error("Share modal element not found");
    alert("Share feature is unavailable. Please try again later.");
    return;
  }
  
  shareDocId = docId;
  
  // Try using jQuery modal method first (which should work with Bootstrap 5)
  try {
    $('#shareModal').modal('show');
    return;
  } catch (err) {
    console.log("jQuery modal method failed, trying native Bootstrap...");
  }
  
  // Try native Bootstrap modal
  try {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
      return;
    }
  } catch (err) {
    console.log("Bootstrap Modal method failed, using fallback...");
  }
  
  // Fallback to manually showing the modal if all else fails
  modalEl.style.display = 'block';
  modalEl.classList.add('show');
  modalEl.setAttribute('aria-modal', 'true');
  modalEl.setAttribute('role', 'dialog');
  document.body.classList.add('modal-open');
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop show';
  document.body.appendChild(backdrop);
}

$(document).ready(function () {
  // Initialize Bootstrap when page loads
  initializeBootstrapIfNeeded();
  
  // Show loading state
  $("#garageRow").html('<div class="col-12 text-center my-5"><div class="spinner-border" role="status"></div><p class="mt-2">Loading vehicles...</p></div>');

  // popup on car added
  const msg = sessionStorage.getItem("carAddedMessage");
  if (msg) {
    $("#popupText").text(msg);
    $("#popupMessage").fadeIn();
    sessionStorage.removeItem("carAddedMessage");
  }
  $("#closePopup").on("click", () => $("#popupMessage").fadeOut());

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("Not logged in");
      $("#garageRow").html('<div class="col-12 text-center"><p>Please log in to view your garage</p></div>');
      return;
    }

    try {
      console.log("Fetching vehicles for user:", user.uid);
      
      // Fetch own cars
      const ownQ = query(collection(db, "cars"), where("userId", "==", user.uid));
      const ownSnap = await getDocs(ownQ);
      
      console.log("Own vehicles:", ownSnap.docs.length);
      
      // Fetch shared cars
      const sharedQ = query(collection(db, "cars"), where("sharedWith", "array-contains", user.uid));
      const sharedSnap = await getDocs(sharedQ);
      
      console.log("Shared vehicles:", sharedSnap.docs.length);
      
      const allDocs = [...ownSnap.docs, ...sharedSnap.docs];
      const uniqueDocs = allDocs.filter((doc, index, self) => 
        index === self.findIndex((d) => d.id === doc.id)
      );
      
      console.log("Total unique vehicles:", uniqueDocs.length);
      
      const $row = $("#garageRow").empty();
      
      if (uniqueDocs.length === 0) {
        $row.html('<div class="col-12 text-center my-4"><p>No vehicles in your garage yet</p><a href="addcar.html" class="btn btn-primary">Add Your First Vehicle</a></div>');
        return;
      }

      // Cache para emails de usuários para evitar chamadas repetidas
      const userEmailCache = {};
      
      for (const docSnap of uniqueDocs) {
        try {
          const car = docSnap.data();
          console.log("Car data:", car);
          
          const docId = docSnap.id;
          const isOwner = car.userId === user.uid;
          const sharedWith = car.sharedWith || [];

          // Get owner email
          let ownerEmail = "You";
          
          if (!isOwner) {
            if (userEmailCache[car.userId]) {
              ownerEmail = userEmailCache[car.userId];
            } else {
              try {
                const ownerDoc = await getDoc(doc(db, "users", car.userId));
                if (ownerDoc.exists()) {
                  ownerEmail = ownerDoc.data().email || "Unknown";
                  userEmailCache[car.userId] = ownerEmail;
                }
              } catch (err) {
                console.error("Error fetching owner email:", err);
              }
            }
          }

          // owner badge (lists emails of recipients)
          let ownerBadge = "";
          if (isOwner && sharedWith.length) {
            const names = await Promise.all(sharedWith.map(async uid => {
              if (userEmailCache[uid]) return userEmailCache[uid].split("@")[0];
              
              try {
                const uSnap = await getDoc(doc(db, "users", uid));
                if (uSnap.exists()) {
                  const email = uSnap.data().email;
                  userEmailCache[uid] = email;
                  return email.split("@")[0];
                }
                return "unknown";
              } catch (err) {
                console.error("Error fetching user data:", err);
                return "unknown";
              }
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
                 ${car.userName || ownerEmail.split("@")[0]}'s car
               </span>`
            : "";

          // build card
          const $col = $("<div>", { class: "col-6 mb-3" });
          const $card = $("<div>", {
            class: "card position-relative",
            css: { borderRadius: "15px" }
          });

          let imgSrc = "images/car.png";
          if (car.vehicleType === "moto") imgSrc = "images/motorbike.png";
          if (car.vehicleType === "truck") imgSrc = "images/truck.png";

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

          // Determine ownership status text
          let ownershipText = "";
          if (isOwner) {
            ownershipText = sharedWith.length > 0 
              ? `<p class="card-text text-primary"><i class="fa-solid fa-share-nodes me-1"></i> Shared with ${sharedWith.length} user${sharedWith.length > 1 ? 's' : ''}</p>` 
              : `<p class="card-text text-success"><i class="fa-solid fa-lock me-1"></i> Private vehicle</p>`;
          } else {
            ownershipText = `<p class="card-text text-info"><i class="fa-solid fa-user me-1"></i> Owner: ${ownerEmail}</p>`;
          }

          const cardInner = `
            ${menuHtml}
            ${ownerBadge}
            ${otherBadge}
            <img src="${imgSrc}" class="card-img-top" alt="${car.vehicleType || 'vehicle'}"
                 style="height:120px;object-fit:contain;padding:10px;">
            <div class="card-body text-start">
              <h5 class="card-title">${car.name || 'Unnamed Vehicle'}</h5>
              <p class="card-text">Plate: ${car.plate || 'Unknown'}</p>
              <p class="card-text">Brand: ${car.brand || 'Unknown'}</p>
              <p class="card-text">Model: ${car.model || 'Unknown'}</p>
              ${ownershipText}
            </div>`;

          $card.html(cardInner);
          $col.append($card);
          $row.append($col);

          $card.find(".custom-dropbtn").on("click", function(e) {
            e.stopPropagation();
            $(".custom-dropdown-content").hide();
            $(this).siblings(".custom-dropdown-content").toggle();
          });
        } catch (err) {
          console.error("Error rendering vehicle card:", err, docSnap.id);
          // Continue with next car if one fails
        }
      }
    } catch (err) {
      console.error("Error loading garage:", err);
      $("#garageRow").html(`<div class="col-12 text-center"><p>Error loading vehicles: ${err.message}</p><button id="retryBtn" class="btn btn-primary">Retry</button></div>`);
      $("#retryBtn").on("click", function() {
        location.reload();
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
      await deleteDoc(doc(db, "cars", removeDocId));
      $(`.remove-car[data-docid="${removeDocId}"]`).closest(".col-6").remove();
      
      // Check if garage is empty after removal
      if ($("#garageRow").children().length === 0) {
        $("#garageRow").html('<div class="col-12 text-center my-4"><p>No vehicles in your garage yet</p><a href="addcar.html" class="btn btn-primary">Add Your First Vehicle</a></div>');
      }
    } catch(err) {
      alert("Error removing vehicle.");
      console.error(err);
    }
    $("#confirmRemovePopup").fadeOut();
    removeDocId = null;
  });

  // Open Share Modal - FIXED VERSION
  $(document).on("click", ".share-car", function(e) {
    e.preventDefault(); 
    e.stopPropagation();
    const docId = $(this).data("docid");
    showShareModal(docId);
    $(".custom-dropdown-content").hide();
  });

  // Close modal manually for fallback
  $(document).on("click", ".btn-close, .modal-backdrop, button[data-bs-dismiss='modal']", function() {
    const modal = document.getElementById("shareModal");
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('show');
      modal.removeAttribute('aria-modal');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      
      // Remove backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    }
  });

  // Handle Share Form
  $("#shareForm").on("submit", async function(e) {
    e.preventDefault();
    const email = $("#shareEmail").val().trim().toLowerCase();
    
    if (!email) {
      alert("Please enter an email address");
      return;
    }
    
    try {
      // find user
      const usersQ = query(collection(db, "users"), where("email", "==", email));
      const usersSnap = await getDocs(usersQ);
      
      if (usersSnap.empty) {
        alert("No user with that email");
        return;
      }
      
      const otherUid = usersSnap.docs[0].id;
      const otherEmail = usersSnap.docs[0].data().email;

      // update car
      await updateDoc(
        doc(db, "cars", shareDocId),
        { sharedWith: arrayUnion(otherUid) }
      );

      // update owner badge immediately
      const $card = $(`.share-car[data-docid="${shareDocId}"]`).closest(".card");
      
      // Update the badge
      $card.find(".owner-share-badge").remove();
      $card.append(`
        <span class="badge bg-warning position-absolute owner-share-badge"
              style="bottom:10px; right:10px; color:#212529;">
          Sharing with ${email.split("@")[0]}
        </span>
      `);
      
      // Update or add the ownership text
      const currentOwnershipText = $card.find(".card-body p.card-text:contains('Private vehicle'), .card-body p.card-text:contains('Shared with')");
      
      if (currentOwnershipText.length) {
        currentOwnershipText.html(`<i class="fa-solid fa-share-nodes me-1"></i> Shared with users`);
        currentOwnershipText.removeClass("text-success").addClass("text-primary");
      } else {
        $card.find(".card-body").append(`
          <p class="card-text text-primary"><i class="fa-solid fa-share-nodes me-1"></i> Shared with users</p>
        `);
      }
      
      alert("Car shared successfully!");
      
      // Close modal with multiple approaches
      try {
        // Try jQuery approach
        $('#shareModal').modal('hide');
      } catch(e) {
        console.log("jQuery hide failed, trying bootstrap");
        try {
          // Try Bootstrap approach
          if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modalEl = document.getElementById("shareModal");
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
          }
        } catch(e2) {
          console.log("Bootstrap hide failed, using manual approach");
          // Manual approach
          const modal = document.getElementById("shareModal");
          if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
          }
        }
      }
    } catch(err) {
      console.error("Error sharing car:", err);
      alert("Failed to share car. Please try again.");
    }
    
    $("#shareEmail").val("");
    shareDocId = null;
  });
});