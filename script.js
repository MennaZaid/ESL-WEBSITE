// API Base URL - Change this to match your backend URL
const API_BASE_URL = 'https://api.aucsu.org';

// Toast notification function
function showToast(type, message) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// Navigation active state
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll("#main-nav .nav-link");

    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPage || (currentPage === "" && href === "index.html")) {
            link.classList.add("active");
        }
    });
});

// Registration Form Handling
document.addEventListener("DOMContentLoaded", () => {
    const citySelect = document.getElementById("city");
    const transportSection = document.getElementById("transportSection");
    const yesRadio = document.getElementById("transportYes");
    const noRadio = document.getElementById("transportNo");
    const transportLocationDiv = document.getElementById("transportLocationDiv");
    const transportLocationInput = document.getElementById("transportLocation");

    // Handle city selection for transport requirement
    if (citySelect) {
        citySelect.addEventListener("change", () => {
            const selectedCity = citySelect.value;

            // Show transport section if city is NOT Cairo or Giza
            if (selectedCity && selectedCity !== "Cairo" && selectedCity !== "Giza") {
                transportSection.style.display = "block";
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
    }

    // Handle "Yes" for transportation
    if (yesRadio) {
        yesRadio.addEventListener("change", () => {
            if (yesRadio.checked) {
                transportLocationDiv.style.display = "block";
                transportLocationInput.required = true;
            }
        });
    }

    // Handle "No" for transportation
    if (noRadio) {
        noRadio.addEventListener("change", () => {
            if (noRadio.checked) {
                transportLocationDiv.style.display = "none";
                transportLocationInput.value = "";
                transportLocationInput.required = false;
            }
        });
    }

    // Registration form submission
    const registrationForm = document.getElementById("registrationForm");

    if (registrationForm) {
        registrationForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Get form data
            const formData = new FormData(registrationForm);

            // Get transportation value
            const needTransport = formData.get('needTransport'); // This should be 'yes' or 'no'
            const transportFrom = formData.get('transportFrom');

            // Add transport data
            if (citySelect && citySelect.value && citySelect.value !== "Cairo" && citySelect.value !== "Giza") {
                // Only if city is not Cairo/Giza
                formData.append('need_transport', needTransport || 'no');
                formData.append('transport_from', needTransport === 'yes' ? (transportFrom || '') : '');
            }

            // Submit button state
            const submitButton = registrationForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";

            try {
                // Send form data to backend
                const response = await fetch(`${API_BASE_URL}/api/v1/esl/registrations`, {
                    method: "POST",
                    body: formData
                });

                // Check if response has content and is JSON
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    console.error("Server returned non-JSON response:", text);
                    showToast("error", "Server error: " + (text || "Invalid response from server"));
                    return;
                }

                const data = await response.json();

                if (response.ok) {
                    // Success - close modal and show success message
                    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                    if (modalInstance) {
                        modalInstance.hide();
                    }

                    // Reset form
                    registrationForm.reset();
                    if (transportSection) transportSection.style.display = "none";
                    if (transportLocationDiv) transportLocationDiv.style.display = "none";

                    // Show success message with toast
                    showToast("success", "Registration successful! We'll contact you soon.");
                } else {
                    // Handle error response
                    const errorMessage = data.message || data.error || "Please try again.";
                    showToast("error", "Registration failed: " + errorMessage);
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                let errorMsg = "An error occurred. Please try again later.";
                
                // Provide more specific error messages
                if (error.message.includes('fetch')) {
                    errorMsg = "Could not connect to server. Make sure the backend server is running.";
                } else if (error.message.includes('Failed to fetch')) {
                    errorMsg = "Network error. Please check your internet connection and try again.";
                } else {
                    errorMsg = `Error: ${error.message}`;
                }
                
                showToast("error", errorMsg);
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
});

// Contact Form Handling
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("questionForm");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            
            // Convert FormData to JSON
            const contactData = {
                name: formData.get("name"),
                email: formData.get("email"),
                phone: formData.get("phone") || null,
                message: formData.get("message")
            };

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";

            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/esl/contacts`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(contactData)
                });

                // Check if response has content and is JSON
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    console.error("Server returned non-JSON response:", text);
                    showToast("error", "Server error: " + (text || "Invalid response from server"));
                    return;
                }

                const data = await response.json();

                if (response.ok) {
                    // Success
                    contactForm.reset();
                    showToast("success", "Message sent successfully! We'll get back to you soon.");
                } else {
                    // Handle error
                    const errorMessage = data.message || data.error || "Please try again.";
                    showToast("error", "Message failed to send: " + errorMessage);
                }
            } catch (error) {
                console.error("Error sending message:", error);
                showToast("error", "An error occurred. Please try again later.");
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
});