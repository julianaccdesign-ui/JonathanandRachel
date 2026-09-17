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
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

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
