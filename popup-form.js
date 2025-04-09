class PopupForm extends HTMLElement {
    constructor() {
      super();
      // Create properties to store references to important elements
      this.isOpen = false;
      this.popupOverlay = null;
      this.closeBtn = null;
      this.form = null;
    }
  
    connectedCallback() {
      // Create the popup structure
      this.innerHTML = `
        <div class="popup-overlay">
          <div class="popup"> 
            <div class="popup-image"></div>
            <div class="popup-content">
              <button class="close-btn">&times;</button>
              <form id="quoteForm" class="quote-form" novalidate>
                <h1>Get your quote</h1>
                
                <p class="form-intro">Complete the fields below and let us handle the rest. One of our experts will be in touch with you soon.</p>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="fullName">Full name</label>
                    <input type="text" id="fullName" name="fullName" placeholder="Type your name" required>
                  </div>
                  
                  <div class="form-group">
                    <label for="company">Company</label>
                    <input type="text" id="company" name="company" placeholder="Type your company" required>
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="phone">Phone (optional)</label>
                    <input type="tel" id="phone" name="phone" placeholder="Enter your phone">
                  </div>
                  
                  <div class="form-group">
                    <label for="email">Email address</label>
                    <input type="email" id="email" name="email" placeholder="Type your company" required>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="message">Message</label>
                  <textarea id="message" name="message" placeholder="Let us know how we can help you" rows="5" required></textarea>
                </div>
                
                <button type="submit" class="submit-btn">Send message</button>
                
                <p class="privacy-notice">By submitting this form you accept our <a href="/privacy-policy">Privacy Policy</a></p>
              </form>
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
  
      // Add event listeners
      this.closeBtn.addEventListener('click', this.close.bind(this));
      this.popupOverlay.addEventListener('click', this.handleOverlayClick.bind(this));
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
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
    }
  
    // Handle clicks on the overlay (close if clicked outside the popup)
    handleOverlayClick(event) {
      if (event.target === this.popupOverlay) {
        this.close();
      }
    }
  
    // Handle form submission
    handleSubmit(event) {
      event.preventDefault();
      
      // Simple form validation
      const isValid = this.validateForm();
      
      if (isValid) {
        // In a real component, you'd handle form submission here
        // For example, sending data via fetch or FormData API
        console.log('Form submitted successfully');
        
        // Reset the form and close the popup
        this.form.reset();
        this.close();
        
        // Dispatch a custom event to notify parent components
        this.dispatchEvent(new CustomEvent('form-submitted', {
          bubbles: true,
          detail: {
            success: true
          }
        }));
      }
    }
  
    // Form validation
    validateForm() {
      const requiredFields = this.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('invalid');
          isValid = false;
        } else {
          field.classList.remove('invalid');
        }
      });
      
      // Additional validation for email
      const emailField = this.querySelector('#email');
      if (emailField && emailField.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value)) {
          emailField.classList.add('invalid');
          isValid = false;
        }
      }
      
      return isValid;
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
    }
  }
  
  // Register the custom element
  customElements.define('popup-form', PopupForm);