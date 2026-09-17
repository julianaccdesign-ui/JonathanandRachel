const form = document.getElementById('rsvp-form');
const status = document.getElementById('form-status');
const submitButton = form?.querySelector('.submit-button');

// Google Apps Script web app that saves RSVP submissions to the wedding spreadsheet.
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyIGAs1iBtCWYFC9OD9asgI9E84XW83vN0OqiNImTFwycgp4yUdKD-ltmc1FFwPnQM/exec';

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-loaded');

  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    const closeMenu = () => {
      menuToggle.classList.remove('is-open');
      mobileNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
    };

    menuToggle.addEventListener('click', () => {
      const willOpen = !mobileNav.classList.contains('is-open');
      menuToggle.classList.toggle('is-open', willOpen);
      mobileNav.classList.toggle('is-open', willOpen);
      menuToggle.setAttribute('aria-expanded', String(willOpen));
      menuToggle.setAttribute('aria-label', willOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  const attireSection = document.querySelector('.attire-section');
  if (attireSection) {
    const loadVenueBackground = () => attireSection.classList.add('bg-loaded');
    if ('IntersectionObserver' in window) {
      const bgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadVenueBackground();
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '500px 0px' });
      bgObserver.observe(attireSection);
    } else {
      loadVenueBackground();
    }
  }

  const revealTargets = [
    '.eyebrow',
    '.details-inner h1',
    '.intro-copy',
    '.detail-card',
    '.attire-content h2',
    '.attire-content p',
    '.palette span',
    '.about-copy h2',
    '.about-copy > p:not(.about-callout)',
    '.about-callout',
    '.about-photo',
    '.rsvp-inner h2',
    '.rsvp-intro',
    '.rsvp-form .field',
    '.submit-button'
  ];

  revealTargets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add(selector.includes('palette span') ? 'reveal-scale' : 'reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index * 80, 320)}ms`);
    });
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px'
  });

  document.querySelectorAll('.reveal, .reveal-scale').forEach((element) => observer.observe(element));
});

if (form) {
  const validationRules = [
    {
      selector: '#full-name',
      message: 'Please enter your full name.'
    },
    {
      selector: 'input[name="attendance"]',
      group: true,
      message: 'Please let us know if you will be joining us.'
    },
    {
      selector: 'input[name="plusOne"]',
      group: true,
      message: 'Please let us know if you are bringing a guest.'
    },
    {
      selector: '#party-size',
      message: 'Please enter the number attending.'
    }
  ];

  const clearFieldError = (container) => {
    if (!container) return;
    container.classList.remove('has-error');
    const error = container.querySelector('.field-error');
    if (error) error.remove();
    container.querySelectorAll('[aria-invalid="true"]').forEach((input) => {
      input.removeAttribute('aria-invalid');
    });
  };

  const showFieldError = (container, controls, message) => {
    if (!container) return;
    clearFieldError(container);
    container.classList.add('has-error');

    const error = document.createElement('p');
    error.className = 'field-error';
    error.textContent = message;
    error.setAttribute('role', 'alert');
    container.appendChild(error);

    controls.forEach((control) => control.setAttribute('aria-invalid', 'true'));
  };

  const validateForm = () => {
    let firstInvalid = null;

    validationRules.forEach((rule) => {
      const controls = Array.from(form.querySelectorAll(rule.selector));
      if (!controls.length) return;

      const container = controls[0].closest('.field');
      let valid = true;

      if (rule.group) {
        valid = controls.some((control) => control.checked);
      } else {
        const control = controls[0];
        valid = control.value.trim() !== '' && control.checkValidity();
      }

      if (!valid) {
        showFieldError(container, controls, rule.message);
        if (!firstInvalid) firstInvalid = controls[0];
      } else {
        clearFieldError(container);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.closest('.field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    return true;
  };

  form.querySelectorAll('input[required]').forEach((input) => {
    const eventName = input.type === 'radio' ? 'change' : 'input';
    input.addEventListener(eventName, () => {
      const container = input.closest('.field');
      if (!container?.classList.contains('has-error')) return;

      if (input.type === 'radio') {
        const group = Array.from(form.querySelectorAll(`input[name="${input.name}"]`));
        if (group.some((item) => item.checked)) clearFieldError(container);
      } else if (input.value.trim() !== '' && input.checkValidity()) {
        clearFieldError(container);
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      status.textContent = 'Please complete the highlighted fields before submitting.';
      return;
    }

    const originalButtonText = submitButton?.textContent || 'Submit';
    const formData = new FormData(form);
    const body = new URLSearchParams();

    formData.forEach((value, key) => {
      body.append(key, value.toString().trim());
    });

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }
    status.textContent = '';

    try {
      await fetch(RSVP_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body
      });

      form.reset();
      form.querySelectorAll('.has-error').forEach(clearFieldError);
      status.textContent = 'Thank you! Your RSVP has been sent.';
    } catch (error) {
      console.error('RSVP submission failed:', error);
      status.textContent = 'Something went wrong. Please try again in a moment.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}
