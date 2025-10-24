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

    // Registration form functionality
    const citySelect = document.getElementById("city");
    const transportSection = document.getElementById("transportSection");
    const yesRadio = document.getElementById("transportYes");
    const noRadio = document.getElementById("transportNo");
    const transportLocationDiv = document.getElementById("transportLocationDiv");
    const transportLocationInput = document.getElementById("transportLocation");

    citySelect.addEventListener("change", () => {
        const selectedCity = citySelect.value;

        // Show transport section if city is NOT Cairo or Giza
        if (selectedCity && selectedCity !== "Cairo" && selectedCity !== "Giza") {
            transportSection.style.display = "block";
            // Make transport radio required when section is visible
            yesRadio.required = true;
            noRadio.required = true;
        } else {
            // Hide and reset transport section
            transportSection.style.display = "none";
            transportLocationDiv.style.display = "none";

            // Clear selections and remove required
            yesRadio.checked = false;
            noRadio.checked = false;
            yesRadio.required = false;
            noRadio.required = false;
            transportLocationInput.value = "";
            transportLocationInput.required = false;
        }
    });

    // Handle "Yes" for transportation
    yesRadio.addEventListener("change", () => {
        if (yesRadio.checked) {
            transportLocationDiv.style.display = "block";
            transportLocationInput.required = true;
        }
    });

    // Handle "No" for transportation
    noRadio.addEventListener("change", () => {
        if (noRadio.checked) {
            transportLocationDiv.style.display = "none";
            transportLocationInput.value = "";
            transportLocationInput.required = false;
        }
    });

    // Form submission handling
    const registrationForm = document.getElementById("registrationForm");

    registrationForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(registrationForm);
        
        // Convert FormData to JSON object
        const registrationData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            age: parseInt(formData.get('age')),
            email: formData.get('email'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            university: formData.get('university'),
            organization: formData.get('organization'),
            role: formData.get('role'),
            need_transport: formData.get('need_transport') || null,
            transport_from: formData.get('transport_from') || null
        };

        // Add loading state
        const submitButton = registrationForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {
            // Send registration data to ESL backend API
            const response = await fetch(`${API_BASE_URL}/registrations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(registrationData)
            });

            const responseData = await response.json();

            if (response.ok) {
                // Success - close modal and show success message
                const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                modal.hide();

                // Reset form
                registrationForm.reset();
                transportSection.style.display = "none";
                transportLocationDiv.style.display = "none";

                // Show success message
                alert("Registration successful! We'll contact you soon.");
            } else {
                // Handle error response
                alert("Registration failed: " + (responseData.message || "Please try again."));
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("An error occurred. Please try again later.");
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
});