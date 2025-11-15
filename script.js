// ESL Website JavaScript
// API Configuration
const API_BASE_URL = 'https://api.aucsu.org/api/v1/esl';

document.addEventListener("DOMContentLoaded", () => {
    // Navigation active state
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll("#main-nav .nav-link");

    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPage || (currentPage === "" && href === "index.html")) {
            link.classList.add("active");
        }
    });

    // Registration is closed - form functionality removed
    // If registration form exists (legacy support), prevent submission
    const registrationForm = document.getElementById("registrationForm");
    if (registrationForm) {
        registrationForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            alert("Registration for ESL 2025 has closed. Thank you for your interest! For inquiries, please contact us.");
        });
    }
});