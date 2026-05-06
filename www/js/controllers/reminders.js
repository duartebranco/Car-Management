import { auth } from "../services/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { carService } from "../services/car.service.js";
import { reminderService } from "../services/reminder.service.js";

let allReminders = [];
let selectedCarId = null;
window.currentCars = [];

function getVehicleImg(type) {
  if (type === "moto") return "images/motorbike.png";
  if (type === "truck") return "images/truck.png";
  return "images/car.png";
}

function getVehicleName(carId, cars) {
  const car = cars.find(c => c.id === carId);
  return car ? (car.name || car.plate || "Unnamed") : "Unknown";
}

function getVehicleType(carId, cars) {
  const car = cars.find(c => c.id === carId);
  return car ? car.vehicleType : "car";
}

function formatDate(date) {
    if (!date) return "";
    let d;
    if (typeof date === "object" && date.seconds) {
      d = new Date(date.seconds * 1000);
    } else {
      d = new Date(date);
      if (isNaN(d)) return date;
    }
    const day = d.toLocaleDateString();
    const hour = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${day}, ${hour}`;
  }

  function renderCarButtons(cars) {
    const $bar = $("#carButtonsBar").empty();
    cars.forEach(car => {
      $bar.append(`
        <button class="car-btn-modern car-btn"
          data-carid="${car.id}"
          data-shared="${car.shared ? "1" : ""}">
          <img src="${getVehicleImg(car.vehicleType)}" alt="${car.name || car.plate || "Car"}" />
          <span class="car-btn-label">${car.name || car.plate || "Unnamed"}</span>
          ${car.shared ? '<span class="shared-badge">Shared</span>' : ""}
        </button>
      `);
    });
  }

function renderReminders(reminders) {
  const $list = $("#remindersList").empty();
  if (reminders.length === 0) {
    $list.append("<li class='list-group-item'>No reminders found.</li>");
    return;
  }
  reminders.sort((a, b) => {
    function getDate(rem) {
      const d = rem.date || rem.reminderDate || rem.createdAt;
      if (d && typeof d === "object" && d.seconds) {
        return new Date(d.seconds * 1000);
      }
      const dateObj = new Date(d);
      return isNaN(dateObj) ? null : dateObj;
    }
    const dateA = getDate(a);
    const dateB = getDate(b);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA - dateB; // Recent first
  });
  reminders.forEach(rem => {
    const carName = getVehicleName(rem.carId, window.currentCars || []);
    const carType = getVehicleType(rem.carId, window.currentCars || []);
    const imgSrc = getVehicleImg(carType);
    const title = rem.title || rem.type || "Reminder";
const date = formatReminderDate(rem);
    $list.append(`
      <li class="reminder-card list-group-item p-0 border-0 position-relative">
        <img class="reminder-img" src="${imgSrc}" alt="vehicle" />
        <div class="reminder-info">
          <div class="reminder-title">${title}</div>
          <div class="reminder-vehicle">${carName}</div>
        </div>
        <div class="reminder-date-actions d-flex align-items-center">
          <span class="reminder-date">${date}</span>
          <div class="reminder-actions">
            <button class="reminder-menu-btn" type="button" aria-label="Actions" tabindex="0">
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <div class="reminder-dropdown-menu">
              <a class="edit-reminder" href="#" data-id="${rem.id}"><i class="fa-solid fa-pen"></i> Edit</a>
              <a class="delete-reminder text-danger" href="#" data-id="${rem.id}"><i class="fa-solid fa-trash"></i> Delete</a>
            </div>
          </div>
        </div>
      </li>
    `);
  });
}

$(document).ready(function () {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      const ownCars = await carService.getUserCars(user.uid);
      const sharedCars = await carService.getSharedCars(user.uid);
      
      ownCars.forEach(c => c.shared = false);
      sharedCars.forEach(c => c.shared = true);
      
      const uniqueCars = Array.from(new Map([...ownCars, ...sharedCars].map(d => [d.id, d])).values());

      window.currentCars = uniqueCars;
      renderCarButtons(uniqueCars);

      allReminders = await reminderService.getUserReminders(user.uid);
      renderReminders(allReminders);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  });
});

// Handler for selecting/deselecting car buttons
$(document).on("click", ".car-btn", function () {
  const $btn = $(this);
  if ($btn.hasClass("selected")) {
    $btn.removeClass("selected");
    selectedCarId = null;
    renderReminders(allReminders);
  } else {
    $(".car-btn").removeClass("selected"); 
    $btn.addClass("selected");
    selectedCarId = $btn.data("carid");
    renderReminders(allReminders.filter(r => r.carId === selectedCarId));
    this.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
});

// Dropdown personalizado (sem Bootstrap)
$(document).on("click", ".reminder-menu-btn", function(e) {
  e.stopPropagation();
  $(".reminder-dropdown-menu").removeClass("show");
  $(this).siblings(".reminder-dropdown-menu").toggleClass("show");
});
$(document).on("click", function() {
  $(".reminder-dropdown-menu").removeClass("show");
});
$(document).on("click", ".reminder-dropdown-menu", function(e) {
  e.stopPropagation();
});

// Handler para editar reminder
$(document).on("click", ".edit-reminder", function (e) {
  e.preventDefault();
  const reminderId = $(this).data("id");
  window.location.href = `editReminder.html?id=${reminderId}`;
});

// Handler para apagar reminder com popup moderno
function showDeletePopup(reminderId, onConfirm) {
  if ($("#confirmDeleteReminderPopup").length) $("#confirmDeleteReminderPopup").remove();
  $("body").append(`
    <div id="confirmDeleteReminderPopup" style="display:flex; align-items:center; justify-content:center; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.25); z-index:20000;">
      <div style="background:#fff; padding:28px 36px; border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,0.18); min-width:260px; text-align:center;">
        <div style="font-size:1.1em; margin-bottom:18px;">Are you sure you want to delete this reminder?</div>
        <button id="cancelDeleteReminderBtn" class="btn btn-secondary me-2">Cancel</button>
        <button id="confirmDeleteReminderBtn" class="btn btn-danger">Delete</button>
      </div>
    </div>
  `);
  $("#cancelDeleteReminderBtn").on("click", () => $("#confirmDeleteReminderPopup").remove());
  $("#confirmDeleteReminderBtn").on("click", () => {
    $("#confirmDeleteReminderPopup").remove();
    onConfirm();
  });
}

$(document).on("click", ".delete-reminder", function (e) {
  e.preventDefault();
  const reminderId = $(this).data("id");
  showDeletePopup(reminderId, async () => {
    try {
      await reminderService.deleteReminder(reminderId);
      allReminders = allReminders.filter(r => r.id !== reminderId);
      renderReminders(selectedCarId ? allReminders.filter(r => r.carId === selectedCarId) : allReminders);
    } catch (err) {
      alert("Failed to delete reminder.");
    }
  });
});

document.getElementById('openFilter').addEventListener('click', function() {
  const bar = document.getElementById('carButtonsBar');
  const filterIcon = document.getElementById('filterBtn');
  if (bar.style.display === 'none' || bar.style.display === '') {
      bar.style.display = 'flex';
  } else {
      bar.style.display = 'none';
  }
});

function formatReminderDate(rem) {
  const rawDate = rem.date || rem.reminderDate || rem.createdAt;
  let d;
  if (rawDate && typeof rawDate === "object" && rawDate.seconds) {
    d = new Date(rawDate.seconds * 1000);
  } else {
    d = new Date(rawDate);
    if (isNaN(d)) return "";
  }

  // Só mostra horas se for manutenção
  if ((rem.type && rem.type.toLowerCase() === "maintenance") || (rem.title && rem.title.toLowerCase() === "maintenance")) {
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }) +
      ", " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
  } else {
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
  }
}