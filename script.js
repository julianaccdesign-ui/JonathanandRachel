const form = document.getElementById('rsvp-form');
const status = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = 'The RSVP form is ready for its submission connection. We’ll connect it to your response sheet next.';
  });
}
