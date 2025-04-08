document.addEventListener("DOMContentLoaded", function() {
    // Sample data for cars – replace with dynamic data as needed
    const cars = [
        { image: "https://via.placeholder.com/80", name: "Toyota Corolla", owner: "John Doe", matricula: "ABC-123" },
        { image: "https://via.placeholder.com/80", name: "Toyota Corolla", owner: "John Doe", matricula: "ABC-123" },
        { image: "https://via.placeholder.com/80", name: "Honda Civic", owner: "Jane Doe", matricula: "XYZ-789" },
        // ...add more cars here
    ];

    const row = document.getElementById("garageRow");
    
    cars.forEach(car => {
        const col = document.createElement("div");
        col.className = "col-6 mb-3"; // Two per row on phone

        const card = document.createElement("div");
        card.className = "card";
        card.style.borderRadius = "15px";
        
        card.innerHTML = `
            <div class="card-body text-start">
                <img src="${car.image}" alt="${car.name}" class="rounded-circle mb-2" style="width: 80px; height:80px;">
                <h5 class="card-title">${car.name}</h5>
                <p class="card-text">Owner: ${car.owner}</p>
                <p class="card-text">Matricula: ${car.matricula}</p>
            </div>`;
        
        col.appendChild(card);
        row.appendChild(col);
    });
});