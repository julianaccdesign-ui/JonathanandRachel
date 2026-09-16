const form = document.getElementById('rsvp-form');
const status = document.getElementById('form-status');

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
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = 'The RSVP form is ready for its submission connection. We’ll connect it to your response sheet next.';
  });
}
