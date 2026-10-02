document.getElementById('year').textContent = new Date().getFullYear();
const viewer = document.getElementById('viewer');
const toggle = document.querySelector('.menu-toggle');
const header = document.querySelector('header');
let photos = [];
let index = 0;
function renderPhoto() {
  const button = photos[index];
  const img = button.querySelector('img');
  document.getElementById('viewer-image').src = button.dataset.photo;
  document.getElementById('viewer-image').alt = img.alt;
  document.getElementById('viewer-caption').textContent =
    button.querySelector('span').textContent;
}
document.querySelectorAll('[data-photo]').forEach(button => {
  button.addEventListener('click', () => {
    const group =
      button.closest('.instagram-gallery') || button.closest('.gallery');
    photos = [...group.querySelectorAll('[data-photo]')].filter(
      photo => !photo.closest('[hidden]')
    );
    index = photos.indexOf(button);
    renderPhoto();
    viewer.showModal();
  });
});
function advance(direction) {
  index = (index + direction + photos.length) % photos.length;
  renderPhoto();
}
document
  .getElementById('next-photo')
  .addEventListener('click', () => advance(1));
document
  .getElementById('prev-photo')
  .addEventListener('click', () => advance(-1));
document
  .getElementById('close-viewer')
  .addEventListener('click', () => viewer.close());
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    advance(1);
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    advance(-1);
  }
});
viewer.addEventListener('click', event => {
  if (event.target === viewer) {
    const rect = viewer.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      viewer.close();
  }
});
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  header.classList.toggle('menu-open', open);
});
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.querySelectorAll('.instagram-card').forEach(card => {
      const video = card
        .querySelector('.photo span')
        .textContent.includes('Video preview');
      card.hidden =
        button.dataset.filter !== 'all' &&
        (button.dataset.filter === 'video') !== video;
    });
    const visibleCount = [...document.querySelectorAll('.instagram-card')].filter(card => !card.hidden).length;
    document.querySelector('.collection-count').textContent = visibleCount + (button.dataset.filter === 'video' ? ' VIDEO PREVIEWS' : button.dataset.filter === 'photo' ? ' PHOTOGRAPHS' : ' PUBLIC POST PREVIEWS');
  });
});
const pages = {
  home: 'Home',
  portfolio: 'Portfolio',
  photography: 'Photography',
  about: 'About Me',
  faq: 'FAQs',
  contact: 'Contact',
};
function showPage() {
  const requested = location.hash.replace(/^#\/?/, '') || 'home';
  const page = Object.prototype.hasOwnProperty.call(pages, requested)
    ? requested
    : 'home';
  if (viewer.open) viewer.close();
  const pricing = document.getElementById('pricing-request');
  if (pricing.open) pricing.close();
  document.querySelectorAll('main > section').forEach(section => {
    section.hidden = (section.dataset.page || section.id) !== page;
  });
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === '#/' + page)
      link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  header.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  document.title = pages[page] + ' | Louise Adrianne Photography';
  window.scrollTo({ top: 0, behavior: 'instant' });
}
window.addEventListener('hashchange', showPage);
showPage();
const enquiryForm = document.getElementById('enquiry-form');
function clearPreparedEnquiry() {
  document.getElementById('prepared-enquiry').hidden = true;
  document.getElementById('enquiry-text').value = '';
  document.getElementById('copy-status').textContent = '';
}
enquiryForm.addEventListener('input', event => {
  if (event.target.id !== 'enquiry-text') clearPreparedEnquiry();
});
document.querySelectorAll('[data-enquiry]').forEach(link => {
  link.addEventListener('click', () => {
    enquiryForm.elements.namedItem('type').value = link.dataset.enquiry;
    clearPreparedEnquiry();
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && header.classList.contains('menu-open')) {
    header.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }
});
enquiryForm.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = String(data.get('name')).trim();
  const message = String(data.get('message')).trim();
  if (!name || !message) {
    const input = form.elements.namedItem(!name ? 'name' : 'message');
    input.setCustomValidity('Please add a little detail here.');
    input.reportValidity();
    input.addEventListener('input', () => input.setCustomValidity(''), {
      once: true,
    });
    return;
  }
  const kind = data.get('type');
  const interest = kind === 'Family session' ? 'a family photography session' : kind === 'Wedding' ? 'wedding photography' : 'your photography services';
  const date = data.get('date') ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(String(data.get('date')) + 'T12:00:00')) : '';
  const details = [
    date ? 'Date: ' + date : '',
    data.get('location') ? 'Location: ' + String(data.get('location')).trim() : '',
    data.get('email') ? 'Email: ' + String(data.get('email')).trim() : '',
    data.get('phone') ? 'Telephone: ' + String(data.get('phone')).trim() : ''
  ].filter(Boolean).join('\n');
  document.getElementById('enquiry-text').value = [
    'Hi Louise, I’m ' + name + '.',
    'I’m interested in ' + interest + '.',
    details,
    message,
    'Could you let me know your availability, pricing and packages? Thank you!'
  ].filter(Boolean).join('\n\n');
  document.getElementById('prepared-enquiry').hidden = false;
  document.getElementById('copy-status').textContent =
    'Your pricing request is ready. Choose Instagram or Hitched below to copy your message and continue. Nothing has been sent yet.';
  document.getElementById('enquiry-text').focus();
});
async function copyEnquiry(openingChat = false, destination = 'instagram') {
  const field = document.getElementById('enquiry-text');
  const message = field.value;
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(message);
    if (field.value !== message) return;
    status.textContent = destination === 'hitched'
      ? 'Copied. On Louise’s Hitched page, click Request pricing, paste your message and complete their form to send it.'
      : openingChat
        ? 'Copied. Paste your enquiry into Louise’s Instagram chat, then tap Send.'
        : 'Copied. Choose Instagram or Hitched, paste your enquiry and complete sending there.';
  } catch {
    if (field.value !== message) return;
    if (!openingChat) {
      field.focus();
      field.select();
    }
    status.textContent =
      'Automatic copying is unavailable. Select and copy the message above, then paste it into Instagram or the Request pricing form on Hitched.';
  }
}
document.getElementById('copy-enquiry').addEventListener('click', () => {
  copyEnquiry();
});
document.getElementById('instagram-enquiry').addEventListener('click', () => {
  // Keep the normal link navigation inside the visitor’s click gesture.
  // Clipboard permission must not delay opening Instagram.
  copyEnquiry(true);
});

const pricingDialog = document.getElementById('pricing-request');
document.querySelectorAll('[data-request-pricing]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('pricing-form-slot').append(enquiryForm);
    pricingDialog.showModal();
    enquiryForm.elements.namedItem('name').focus();
  });
});
document.getElementById('close-pricing').addEventListener('click', () => {
  pricingDialog.close();
});
pricingDialog.addEventListener('close', () => {
  document.getElementById('enquiry-inline').append(enquiryForm);
});
document.getElementById('hitched-enquiry').addEventListener('click', () => {
  copyEnquiry(true, 'hitched');
});

