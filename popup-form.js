class PopupForm extends HTMLElement {
  constructor() {
    super();
    // Create properties to store references to important elements
    this.isOpen = false;
    this.popupOverlay = null;
    this.closeBtn = null;
    this.form = null;
    this.errorMessages = {}; // Store error messages for each field
  }

  connectedCallback() {
    // Create the popup structure (keeping your original HTML)
    this.innerHTML = `
      <div class="popup-overlay">
        <div class="popup"> 
          <div class="popup-image"></div>
          <div class="popup-content">
            <button class="close-btn">&times;</button>


            <!-- Form View -->
            <form id="quoteForm" class="quote-form" novalidate>
              <h1>Get your quote</h1>
              
              <p class="form-intro">Complete the fields below and let us handle the rest. One of our experts will be in touch with you soon.</p>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="fullName">Full name</label>
                  <input type="text" id="fullName" name="fullName" placeholder="Type your name" required>
                  <span class="error-message" id="fullName-error"></span>
                </div>
                
                <div class="form-group">
                  <label for="company">Company</label>
                  <input type="text" id="company" name="company" placeholder="Type your company" required>
                  <span class="error-message" id="company-error"></span>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Phone (optional)</label>
                  <input type="tel" id="phone" name="phone" placeholder="Enter your phone">
                  <span class="error-message" id="phone-error"></span>
                </div>
                
                <div class="form-group">
                  <label for="email">Email address</label>
                  <input type="email" id="email" name="email" placeholder="Type your email" required>
                  <span class="error-message" id="email-error"></span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" placeholder="Let us know how we can help you" rows="5"></textarea>
              </div>
              
              <button type="submit" class="submit-btn">Send message</button>
              
              <p class="privacy-notice">By submitting this form you accept our <a href="/privacy-policy">Privacy Policy</a></p>
            </form>

          <!-- Success View (initially hidden) -->
             <div class="success-message" style="display: none";>
            <h2>Your request has been submitted successfully!</h2>
            <p>Thanks for requesting a quote, one of our representatives will be in touch shortly!</p>
            <button type="button" class="continue-btn">Continue</button>
          </div>


          </div>
        </div>
      </div>
    `;

    // Initialize the component
    this.initializePopup();
  }

  initializePopup() {
    // Cache DOM elements
    this.popupOverlay = this.querySelector('.popup-overlay');
    this.closeBtn = this.querySelector('.close-btn');
    this.form = this.querySelector('.quote-form');
    
    // Initially hide the popup
    this.popupOverlay.style.display = 'none';
    this.isOpen = false;
  
    // Cache all input elements and error message spans
    this.inputs = this.querySelectorAll('input, textarea');
    this.errorSpans = this.querySelectorAll('.error-message');
    
    // Track if form submission has been attempted
    this.submitAttempted = false;
  
    // Add event listeners
    this.closeBtn.addEventListener('click', this.close.bind(this));
    this.popupOverlay.addEventListener('click', this.handleOverlayClick.bind(this));
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Add input event listeners for validation ONLY after first submit attempt
    this.inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (this.submitAttempted) {
          this.validateField(input);
        }
      });
    });

    const continueBtn = this.querySelector('.continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', this.close.bind(this));
    }

  }

  // Open the popup
  open() {
    this.popupOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    this.isOpen = true;
    
    // Focus on the first input for accessibility
    setTimeout(() => {
      const firstInput = this.querySelector('input[id="fullName"]');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  // Close the popup
  close() {
    this.popupOverlay.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
    this.isOpen = false;
    this.resetForm();
    
    // Reset views - hide success, show form
    const successMessage = this.querySelector('.success-message');
    if (successMessage) {
      successMessage.style.display = 'none';
    }
    if (this.form) {
      this.form.style.display = 'flex';
    }
  }

  // Handle clicks on the overlay (close if clicked outside the popup)
  handleOverlayClick(event) {
    if (event.target === this.popupOverlay) {
      this.close();
    }
  }

  // Reset the form and clear error messages
  resetForm() {
    this.form.reset();
    this.submitAttempted = false;
    this.errorSpans.forEach(span => {
      span.textContent = '';
      span.classList.remove('active');
    });
    this.inputs.forEach(input => {
      input.classList.remove('invalid');
    });
  }

  // Validate a specific field
  validateField(field) {
    const fieldId = field.id;
    const errorSpan = this.querySelector(`#${fieldId}-error`);
    let isValid = true;
    let errorMessage = '';

    // Remove existing error styles
    field.classList.remove('invalid');
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.classList.remove('active');
    }

    // Check if the field is required and empty
    if (field.required && !field.value.trim()) {
      isValid = false;
      errorMessage = 'This field is required';
    } 
    // Custom validation based on field type
    else if (field.value.trim()) {
      switch (field.type) {
        case 'email':
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
          }
          break;
        case 'tel':
          if (field.value.trim()) { // Only validate if not empty (since it's optional)
            const phonePattern = /^[\d\s\(\)\-\+]+$/;
            if (!phonePattern.test(field.value)) {
              isValid = false;
              errorMessage = 'Please enter a valid phone number';
            }
          }
          break;
      }
    }

    // Update UI based on validation result
    if (!isValid) {
      field.classList.add('invalid');
      if (errorSpan) {
        errorSpan.textContent = errorMessage;
        errorSpan.classList.add('active');
      }
    }

    return isValid;
  }

showSuccessMessage() {
  // Hide form
  this.form.style.display = 'none';
  
  // Show success message
  const successMessage = this.querySelector('.success-message');
  successMessage.style.display = 'block';
}

  // Handle form submission
// Handle form submission
handleSubmit(event) {
  event.preventDefault();
  
  // Mark that submission has been attempted
  this.submitAttempted = true;
  
  // Validate all fields
  let isFormValid = true;
  this.inputs.forEach(input => {
    const fieldIsValid = this.validateField(input);
    if (!fieldIsValid) {
      isFormValid = false;
    }
  });
  
  if (isFormValid) {
    // In a real component, you'd handle form submission here
    // For example, sending data via fetch or FormData API
    console.log('Form submitted successfully');
    
    // CHANGE THIS LINE: Show success message instead of closing
    this.showSuccessMessage();
    
    // Dispatch a custom event to notify parent components
    this.dispatchEvent(new CustomEvent('form-submitted', {
      bubbles: true,
      detail: {
        success: true
      }
    }));
  } else {
    // Focus on the first invalid field
    const firstInvalid = this.querySelector('.invalid');
    if (firstInvalid) {
      firstInvalid.focus();
    }
  }
}



  // Close popup on escape key
  handleKeyDown(event) {
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  // Clean up event listeners when element is removed
  disconnectedCallback() {
    this.closeBtn.removeEventListener('click', this.close);
    this.popupOverlay.removeEventListener('click', this.handleOverlayClick);
    this.form.removeEventListener('submit', this.handleSubmit);
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Remove input event listeners
    this.inputs.forEach(input => {
      input.removeEventListener('input', this.validateField);
      input.removeEventListener('blur', this.validateField);
    });
  }
}

// Register the custom element
customElements.define('popup-form', PopupForm);