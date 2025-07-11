// Multi-Step Form Application
class MultiStepForm {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 5;
    this.formData = {
      name: '',
      email: '',
      phone: '',
      plan: '',
      billing: 'monthly',
      addons: []
    };
    
    this.planPrices = {
      arcade: { monthly: 9, yearly: 90 },
      advanced: { monthly: 12, yearly: 120 },
      pro: { monthly: 15, yearly: 150 }
    };
    
    this.addonPrices = {
      'online-service': { monthly: 1, yearly: 10 },
      'larger-storage': { monthly: 2, yearly: 20 },
      'customizable-profile': { monthly: 2, yearly: 20 }
    };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.updateStepIndicator();
    this.updateNavigation();
  }
  
  bindEvents() {
    // Navigation buttons
    document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
    document.getElementById('back-btn').addEventListener('click', () => this.prevStep());
    document.getElementById('confirm-btn').addEventListener('click', () => this.confirmOrder());

    // Form inputs
    document.getElementById('multi-step-form').addEventListener('input', (e) => this.handleInput(e));
    document.getElementById('multi-step-form').addEventListener('change', (e) => this.handleChange(e));

    // Plan selection
    document.querySelectorAll('.plan-card').forEach(card => {
      card.addEventListener('click', () => this.selectPlan(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectPlan(card);
        }
      });
      // Make plan cards focusable
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'radio');
    });

    // Billing toggle
    document.getElementById('billing-toggle').addEventListener('change', () => this.toggleBilling());

    // Add-on selection
    document.querySelectorAll('.addon-card').forEach(card => {
      card.addEventListener('click', () => this.toggleAddon(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleAddon(card);
        }
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
  }

  handleKeyboardNavigation(e) {
    // Allow Enter key to trigger next step on navigation buttons
    if (e.key === 'Enter') {
      const activeElement = document.activeElement;
      if (activeElement.id === 'next-btn') {
        this.nextStep();
      } else if (activeElement.id === 'back-btn') {
        this.prevStep();
      } else if (activeElement.id === 'confirm-btn') {
        this.confirmOrder();
      }
    }
  }
  
  handleInput(e) {
    const { name, value } = e.target;
    if (name in this.formData) {
      this.formData[name] = value;
      this.clearError(name);
    }
  }
  
  handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (type === 'radio' && name === 'plan') {
      this.formData.plan = value;
      this.clearError('plan');
    } else if (type === 'checkbox' && name === 'billing') {
      this.formData.billing = checked ? 'yearly' : 'monthly';
      this.updatePlanPrices();
      this.updateAddonPrices();
    }
  }
  
  selectPlan(card) {
    // Remove previous selection and ARIA attributes
    document.querySelectorAll('.plan-card').forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
    });

    // Add selection to clicked card
    card.classList.add('selected');
    card.setAttribute('aria-checked', 'true');

    // Update form data
    const planValue = card.dataset.plan;
    this.formData.plan = planValue;

    // Check the radio button
    const radio = card.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;

    this.clearError('plan');

    // Announce selection to screen readers
    this.announceToScreenReader(`${planValue} plan selected`);
  }
  
  toggleBilling() {
    const toggle = document.getElementById('billing-toggle');
    const monthlyLabel = document.querySelector('.billing-label.monthly');
    const yearlyLabel = document.querySelector('.billing-label.yearly');
    
    if (toggle.checked) {
      this.formData.billing = 'yearly';
      monthlyLabel.classList.remove('active');
      yearlyLabel.classList.add('active');
    } else {
      this.formData.billing = 'monthly';
      monthlyLabel.classList.add('active');
      yearlyLabel.classList.remove('active');
    }
    
    this.updatePlanPrices();
    this.updateAddonPrices();
  }
  
  updatePlanPrices() {
    const isYearly = this.formData.billing === 'yearly';
    const suffix = isYearly ? '/yr' : '/mo';
    
    document.querySelectorAll('.plan-card').forEach(card => {
      const plan = card.dataset.plan;
      const priceElement = card.querySelector('.plan-price');
      const discountElement = card.querySelector('.plan-discount');
      
      if (priceElement && this.planPrices[plan]) {
        const price = this.planPrices[plan][this.formData.billing];
        priceElement.textContent = `$${price}${suffix}`;
        
        if (discountElement) {
          if (isYearly) {
            discountElement.textContent = '2 months free';
            discountElement.classList.remove('hidden');
          } else {
            discountElement.classList.add('hidden');
          }
        }
      }
    });
  }
  
  updateAddonPrices() {
    const isYearly = this.formData.billing === 'yearly';
    const suffix = isYearly ? '/yr' : '/mo';
    
    document.querySelectorAll('.addon-card').forEach(card => {
      const addon = card.querySelector('input[type="checkbox"]').value;
      const priceElement = card.querySelector('.addon-price');
      
      if (priceElement && this.addonPrices[addon]) {
        const price = this.addonPrices[addon][this.formData.billing];
        priceElement.textContent = `+$${price}${suffix}`;
      }
    });
  }
  
  toggleAddon(card) {
    const checkbox = card.querySelector('input[type="checkbox"]');
    const addonValue = checkbox.value;

    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
      if (!this.formData.addons.includes(addonValue)) {
        this.formData.addons.push(addonValue);
      }
      this.announceToScreenReader(`${addonValue.replace('-', ' ')} add-on selected`);
    } else {
      card.classList.remove('selected');
      card.setAttribute('aria-checked', 'false');
      this.formData.addons = this.formData.addons.filter(addon => addon !== addonValue);
      this.announceToScreenReader(`${addonValue.replace('-', ' ')} add-on deselected`);
    }
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove the announcement after a short delay
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  validateStep(step) {
    let isValid = true;
    
    switch (step) {
      case 1:
        isValid = this.validatePersonalInfo();
        break;
      case 2:
        isValid = this.validatePlanSelection();
        break;
      case 3:
        // Add-ons are optional, so always valid
        isValid = true;
        break;
      case 4:
        isValid = true;
        break;
    }
    
    return isValid;
  }
  
  validatePersonalInfo() {
    let isValid = true;

    // Name validation
    if (!this.formData.name.trim()) {
      this.showError('name', 'This field is required');
      isValid = false;
    } else if (this.formData.name.trim().length < 2) {
      this.showError('name', 'Name must be at least 2 characters long');
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.formData.email.trim()) {
      this.showError('email', 'This field is required');
      isValid = false;
    } else if (!emailRegex.test(this.formData.email)) {
      this.showError('email', 'Please enter a valid email address');
      isValid = false;
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!this.formData.phone.trim()) {
      this.showError('phone', 'This field is required');
      isValid = false;
    } else if (!phoneRegex.test(this.formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      this.showError('phone', 'Please enter a valid phone number');
      isValid = false;
    }

    return isValid;
  }
  
  validatePlanSelection() {
    if (!this.formData.plan) {
      this.showError('plan', 'Please select a plan');
      return false;
    }
    return true;
  }

  validateField(fieldName) {
    switch (fieldName) {
      case 'name':
        if (!this.formData.name.trim()) {
          this.showError('name', 'This field is required');
          return false;
        } else if (this.formData.name.trim().length < 2) {
          this.showError('name', 'Name must be at least 2 characters long');
          return false;
        } else {
          this.clearError('name');
          return true;
        }
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.formData.email.trim()) {
          this.showError('email', 'This field is required');
          return false;
        } else if (!emailRegex.test(this.formData.email)) {
          this.showError('email', 'Please enter a valid email address');
          return false;
        } else {
          this.clearError('email');
          return true;
        }
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!this.formData.phone.trim()) {
          this.showError('phone', 'This field is required');
          return false;
        } else if (!phoneRegex.test(this.formData.phone.replace(/[\s\-\(\)]/g, ''))) {
          this.showError('phone', 'Please enter a valid phone number');
          return false;
        } else {
          this.clearError('phone');
          return true;
        }
      default:
        return true;
    }
  }
  
  showError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
      errorElement.textContent = message;
    }
    
    if (inputElement) {
      inputElement.classList.add('error');
    }
  }
  
  clearError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
      errorElement.textContent = '';
    }
    
    if (inputElement) {
      inputElement.classList.remove('error');
    }
  }
  
  nextStep() {
    if (this.validateStep(this.currentStep)) {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
        this.showStep(this.currentStep);
        this.updateStepIndicator();
        this.updateNavigation();
        
        if (this.currentStep === 4) {
          this.updateSummary();
        }
      }
    }
  }
  
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
      this.updateStepIndicator();
      this.updateNavigation();
    }
  }
  
  goToStep(step) {
    if (step >= 1 && step <= this.totalSteps - 1) {
      this.currentStep = step;
      this.showStep(this.currentStep);
      this.updateStepIndicator();
      this.updateNavigation();
    }
  }
  
  showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(content => {
      content.classList.remove('active');
    });

    // Show current step - specifically target step-content elements
    const currentStepElement = document.querySelector(`.step-content[data-step="${step}"]`);
    if (currentStepElement) {
      currentStepElement.classList.add('active');

      // Focus management
      this.manageFocus(step);
    } else {
      console.error(`Step content not found for step ${step}`);
    }
  }

  manageFocus(step) {
    // Focus on the first interactive element in the current step
    setTimeout(() => {
      const currentStepElement = document.querySelector(`[data-step="${step}"].active`);
      if (currentStepElement) {
        const firstInput = currentStepElement.querySelector('input, button, [tabindex="0"]');
        if (firstInput) {
          firstInput.focus();
        } else {
          // Focus on the step header if no interactive elements
          const stepHeader = currentStepElement.querySelector('h1');
          if (stepHeader) {
            stepHeader.setAttribute('tabindex', '-1');
            stepHeader.focus();
          }
        }
      }
    }, 100);
  }
  
  updateStepIndicator() {
    document.querySelectorAll('.step-number').forEach((indicator, index) => {
      const stepNumber = index + 1;
      if (stepNumber === this.currentStep) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'step');
      } else {
        indicator.classList.remove('active');
        indicator.removeAttribute('aria-current');
      }
    });
  }
  
  updateNavigation() {
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    const confirmBtn = document.getElementById('confirm-btn');

    // Back button
    if (this.currentStep === 1) {
      backBtn.classList.add('hidden');
    } else {
      backBtn.classList.remove('hidden');
    }

    // Next/Confirm buttons
    if (this.currentStep === 4) {
      nextBtn.classList.add('hidden');
      confirmBtn.classList.remove('hidden');
    } else if (this.currentStep === 5) {
      nextBtn.classList.add('hidden');
      confirmBtn.classList.add('hidden');
      backBtn.classList.add('hidden');
    } else {
      nextBtn.classList.remove('hidden');
      confirmBtn.classList.add('hidden');
    }
  }

  updateSummary() {
    this.updateSelectedPlan();
    this.updateSelectedAddons();
    this.updateTotal();
  }

  updateSelectedPlan() {
    const planNameElement = document.getElementById('selected-plan-name');
    const planPriceElement = document.getElementById('selected-plan-price');

    if (this.formData.plan && planNameElement && planPriceElement) {
      const planName = this.formData.plan.charAt(0).toUpperCase() + this.formData.plan.slice(1);
      const billingType = this.formData.billing === 'yearly' ? 'Yearly' : 'Monthly';
      const price = this.planPrices[this.formData.plan][this.formData.billing];
      const suffix = this.formData.billing === 'yearly' ? '/yr' : '/mo';

      planNameElement.textContent = `${planName} (${billingType})`;
      planPriceElement.textContent = `$${price}${suffix}`;
    }
  }

  updateSelectedAddons() {
    const addonsContainer = document.getElementById('selected-addons');

    if (!addonsContainer) return;

    addonsContainer.innerHTML = '';

    if (this.formData.addons.length === 0) {
      addonsContainer.style.display = 'none';
      return;
    }

    addonsContainer.style.display = 'block';

    const addonNames = {
      'online-service': 'Online service',
      'larger-storage': 'Larger storage',
      'customizable-profile': 'Customizable Profile'
    };

    this.formData.addons.forEach(addon => {
      const addonDiv = document.createElement('div');
      addonDiv.className = 'addon-summary';

      const price = this.addonPrices[addon][this.formData.billing];
      const suffix = this.formData.billing === 'yearly' ? '/yr' : '/mo';

      addonDiv.innerHTML = `
        <span>${addonNames[addon]}</span>
        <span>+$${price}${suffix}</span>
      `;

      addonsContainer.appendChild(addonDiv);
    });
  }

  updateTotal() {
    const totalLabelElement = document.getElementById('total-label');
    const totalAmountElement = document.getElementById('total-amount');

    if (!totalLabelElement || !totalAmountElement) return;

    let total = 0;

    // Add plan price
    if (this.formData.plan) {
      total += this.planPrices[this.formData.plan][this.formData.billing];
    }

    // Add addon prices
    this.formData.addons.forEach(addon => {
      total += this.addonPrices[addon][this.formData.billing];
    });

    const suffix = this.formData.billing === 'yearly' ? '/yr' : '/mo';
    const period = this.formData.billing === 'yearly' ? 'year' : 'month';

    totalLabelElement.textContent = `Total (per ${period})`;
    totalAmountElement.textContent = `$${total}${suffix}`;
  }

  confirmOrder() {
    // EDUCATIONAL PROJECT NOTICE:
    // This is a demonstration project - NO DATA IS ACTUALLY SENT TO ANY SERVER
    // In a real application, you would send the data to a backend API
    // For this educational project, we only log to console and show confirmation
    console.log('Educational Project - Form Data (NOT SENT TO SERVER):', this.formData);

    // Show thank you step
    this.currentStep = 5;
    this.showStep(this.currentStep);
    this.updateStepIndicator();
    this.updateNavigation();

    // Announce completion to screen readers
    this.announceToScreenReader('Order confirmed successfully. Thank you for using this educational demo.');
  }
}

// Global function to allow calling from HTML
function goToStep(step) {
  if (window.multiStepForm) {
    window.multiStepForm.goToStep(step);
  }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing multi-step form...');

  try {
    window.multiStepForm = new MultiStepForm();
    console.log('Multi-step form initialized successfully');
  } catch (error) {
    console.error('Error initializing multi-step form:', error);
  }

  // Add form submission prevention
  const form = document.getElementById('multi-step-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Form submission prevented (this is correct for demo)');
    });
  }

  // Add real-time validation for inputs
  document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
    input.addEventListener('blur', () => {
      if (window.multiStepForm) {
        window.multiStepForm.validateField(input.name);
      }
    });
  });

  // Debug: Add click listener to next button to see if it's working
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    console.log('Next button found and event listener will be attached');
  } else {
    console.error('Next button not found!');
  }
});
