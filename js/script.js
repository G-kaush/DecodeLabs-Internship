const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-links a');
const themeToggle = document.querySelector('.theme-toggle');
const filterButtons = document.querySelectorAll('.filter-btn');
const courseCards = document.querySelectorAll('.course-card');
const faqItems = document.querySelectorAll('.faq-item');
const contactForm = document.querySelector('.contact-form');
const successMessage = document.querySelector('.form-success');

function closeMenu() {
  navMenu.classList.remove('open');
  body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
}

function toggleMenu() {
  const isOpen = navMenu.classList.toggle('open');
  body.classList.toggle('menu-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
}

menuToggle.addEventListener('click', toggleMenu);

navLinks.forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  localStorage.setItem('skillhub-theme', theme);
}

const storedTheme = localStorage.getItem('skillhub-theme');
const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
applyTheme(storedTheme || defaultTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme || 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => filterButton.classList.remove('active'));
    button.classList.add('active');

    courseCards.forEach((card) => {
      const shouldShow = selectedFilter === 'all' || card.dataset.category === selectedFilter;
      card.classList.toggle('hidden', !shouldShow);
    });
  });
});

faqItems.forEach((item) => {
  const button = item.querySelector('button');
  const icon = button.querySelector('span');

  button.addEventListener('click', () => {
    const isOpen = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
    icon.textContent = isOpen ? '−' : '+';
  });
});

function showError(field, message) {
  const formField = field.closest('.form-field');
  const errorMessage = formField.querySelector('.error-message');
  formField.classList.add('invalid');
  errorMessage.textContent = message;
}

function clearError(field) {
  const formField = field.closest('.form-field');
  const errorMessage = formField.querySelector('.error-message');
  formField.classList.remove('invalid');
  errorMessage.textContent = '';
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateField(field) {
  const value = field.value.trim();

  if (field.required && !value) {
    showError(field, 'This field is required.');
    return false;
  }

  if (field.type === 'email' && value && !validateEmail(value)) {
    showError(field, 'Enter a valid email address.');
    return false;
  }

  if (field.minLength > 0 && value.length < field.minLength) {
    showError(field, `Please enter at least ${field.minLength} characters.`);
    return false;
  }

  clearError(field);
  return true;
}

if (contactForm) {
  const formFields = contactForm.querySelectorAll('input, select, textarea');

  formFields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => clearError(field));
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let isFormValid = true;

    formFields.forEach((field) => {
      if (!validateField(field)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      successMessage.textContent = '';
      return;
    }

    successMessage.textContent = 'Thank you! Your enquiry has been prepared successfully.';
    contactForm.reset();
  });
}
