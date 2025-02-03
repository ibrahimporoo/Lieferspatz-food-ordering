// navbar.js
function renderNavbar() {
    const navbar = document.getElementById('navbar');
    const accessToken = localStorage.getItem('accessToken');
    const balance = localStorage.getItem('userBalance');
    const type = localStorage.getItem('type');

    if (accessToken) {
        if (type == 'user') {
            // User navbar
            navbar.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: white; margin-right: 1rem;">Kontostand: €${parseFloat(balance).toFixed(2)}</span>
                    <a href="restaurants.html" class="nav-button">Restaurants</a>
                    <a href="restaurants-open.html" class="nav-button">Offene Restaurants</a>
                    <a href="baskets.html" class="nav-button">Körbe</a>
                    <a href="orders.html" class="nav-button">Bestellungen</a>
                    <a href="profile.html" class="nav-button">Profil</a>
                    <button class="nav-button" onclick="logout()">Ausloggen</button>
                </div>
            `;
        }
        else if (type == 'restaurant') {
            // User navbar
            navbar.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: white; margin-right: 1rem;">Kontostand: €${parseFloat(balance).toFixed(2)}</span>
                    <a href="menu.html" class="nav-button">Speisekarte</a>
                    <a href="restaurant-orders.html" class="nav-button">Bestellungen</a>
                    <a href="restaurant-profile.html" class="nav-button">Profil</a>
                    <button class="nav-button" onclick="logout()">Ausloggen</button>
                </div>
            `;
        }

    } else {
        // Default navbar
        navbar.innerHTML = `
            <a href="restaurants.html" class="nav-button">Restaurants</a>
            <a href="user-login.html" class="nav-button">Kundenanmeldung</a>
            <a href="restaurant-login.html" class="nav-button">Restaurantsanmeldung</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userBalance');
    localStorage.removeItem('type');
    window.location.href = 'index.html';
}

// Render navbar when page loads
document.addEventListener('DOMContentLoaded', renderNavbar);