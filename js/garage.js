import { db, auth } from "./firebase.js";
import {
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
    doc as firestoreDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

let removeDocId = null; // Para guardar o id do veículo a remover

$(document).ready(function () {
    // Mostra popup se existir mensagem
    const msg = sessionStorage.getItem("carAddedMessage");
    if (msg) {
        $("#popupText").text(msg);
        $("#popupMessage").fadeIn();
        sessionStorage.removeItem("carAddedMessage");
    }
    $("#closePopup").on("click", function() {
        $("#popupMessage").fadeOut();
    });

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.log("User not logged in.");
            return;
        }

        // Query for cars matching the user's UID
        const q = query(collection(db, "cars"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const $row = $("#garageRow");
        $row.empty();

        querySnapshot.forEach((doc, idx) => {
            const car = doc.data();
            const docId = doc.id;
            const $col = $("<div>", { class: "col-6 mb-3" });
            const $card = $("<div>", {
                class: "card position-relative",
                css: { borderRadius: "15px" },
            });

            // Escolhe a imagem conforme o tipo de veículo
            let imgSrc = "images/car.png";
            if (car.vehicleType === "moto") imgSrc = "images/motorbike.png";
            else if (car.vehicleType === "truck") imgSrc = "images/truck.png";

            // Menu custom sem Bootstrap (sem id!)
            const menuHtml = `
                <div class="custom-dropdown" style="position:absolute; top:10px; right:10px;">
                    <button class="custom-dropbtn" style="background:none; border:none; cursor:pointer;">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <div class="custom-dropdown-content">
                        <a href="#">Edit</a>
                        <a href="#">Share</a>
                        <a href="#" class="remove-car" data-docid="${docId}" style="color:red;">Remove</a>
                    </div>
                </div>
            `;

            const cardInnerHtml = `
                ${menuHtml}
                <img src="${imgSrc}" class="card-img-top" alt="${car.vehicleType}" style="height:120px;object-fit:contain;padding:10px;">
                <div class="card-body text-start">
                    <h5 class="card-title">${car.name}</h5>
                    <p class="card-text">Plate: ${car.plate}</p>
                    <p class="card-text">Brand: ${car.brand}</p>
                    <p class="card-text">Model: ${car.model}</p>
                </div>
            `;
            $card.html(cardInnerHtml);
            $col.append($card);
            $row.append($col);

            // Evento para mostrar/ocultar o menu (apenas deste card)
            $card.find('.custom-dropbtn').on('click', function(e) {
                e.stopPropagation();
                $('.custom-dropdown-content').hide(); // Fecha outros menus
                $(this).siblings('.custom-dropdown-content').toggle(); // Só este menu
            });
        });
    });

    // Fecha o menu ao clicar fora
    $(document).on('click', function() {
        $('.custom-dropdown-content').hide();
    });

    // Handler para abrir popup de confirmação de remoção
    $(document).on('click', '.remove-car', function(e) {
        e.preventDefault();
        e.stopPropagation();
        removeDocId = $(this).data('docid');
        $("#confirmRemovePopup").fadeIn();
        $('.custom-dropdown-content').hide();
    });

    // Handler para cancelar remoção
    $("#cancelRemoveBtn").on('click', function() {
        $("#confirmRemovePopup").fadeOut();
        removeDocId = null;
    });

    // Handler para confirmar remoção
    $("#confirmRemoveBtn").on('click', async function() {
        if (removeDocId) {
            try {
                await deleteDoc(firestoreDoc(db, "cars", removeDocId));
                // Remove o card do DOM
                $(`.remove-car[data-docid="${removeDocId}"]`).closest('.col-6').remove();
            } catch (err) {
                alert("Erro ao remover veículo.");
                console.error(err);
            }
        }
        $("#confirmRemovePopup").fadeOut();
        removeDocId = null;
    });
});