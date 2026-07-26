const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-links a');
const themeToggle = document.querySelector('.theme-toggle');
const filterButtons = document.querySelectorAll('.filter-btn');
const courseGrid = document.querySelector('.course-grid');
const faqItems = document.querySelectorAll('.faq-item');
const contactForm = document.querySelector('.contact-form');
const successMessage = document.querySelector('.form-success');
const courseSelect = document.querySelector('#course');
let activeCourseFilter = 'all';

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
  themeToggle.innerHTML = theme === 'dark' ? '&#9728;' : '&#9790;';
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
    activeCourseFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => filterButton.classList.remove('active'));
    button.classList.add('active');

    applyCourseFilter();
  });
});

function getCourseCards() {
  return document.querySelectorAll('.course-card');
}

function applyCourseFilter() {
  getCourseCards().forEach((card) => {
    const shouldShow = activeCourseFilter === 'all' || card.dataset.category === activeCourseFilter;
    card.classList.toggle('hidden', !shouldShow);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderCourses(courses) {
  if (!courseGrid || !Array.isArray(courses) || courses.length === 0) {
    return;
  }

  courseGrid.innerHTML = courses.map((course) => `
    <article class="course-card" data-category="${escapeHtml(course.category)}">
      <div class="course-tag">${escapeHtml(course.category)}</div>
      <h3>${escapeHtml(course.title)}</h3>
      <p>${escapeHtml(course.description)}</p>
      <div class="course-meta">
        <span>${escapeHtml(course.level)}</span>
        <span>${escapeHtml(course.duration)}</span>
      </div>
    </article>
  `).join('');

  applyCourseFilter();
}

function populateCourseSelect(courses) {
  if (!courseSelect || !Array.isArray(courses) || courses.length === 0) {
    return;
  }

  const currentValue = courseSelect.value;
  courseSelect.innerHTML = '<option value="">Choose one</option>';

  courses.forEach((course) => {
    const option = document.createElement('option');
    option.value = course.slug;
    option.textContent = course.title;
    courseSelect.append(option);
  });

  courseSelect.value = courses.some((course) => course.slug === currentValue) ? currentValue : '';
}

async function loadCourses() {
  try {
    const response = await fetch('/api/courses');

    if (!response.ok) {
      throw new Error('Courses could not be loaded.');
    }

    const data = await response.json();
    renderCourses(data.courses);
    populateCourseSelect(data.courses);
  } catch (error) {
    applyCourseFilter();
  }
}

loadCourses();

faqItems.forEach((item) => {
  const button = item.querySelector('button');
  const icon = button.querySelector('span');

  button.addEventListener('click', () => {
    const isOpen = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
    icon.textContent = isOpen ? '-' : '+';
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
  const submitButton = contactForm.querySelector('button[type="submit"]');

  formFields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => clearError(field));
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    let isFormValid = true;

    formFields.forEach((field) => {
      if (!validateField(field)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      successMessage.textContent = '';
      successMessage.classList.remove('error');
      return;
    }

    const enquiry = Object.fromEntries(new FormData(contactForm).entries());
    successMessage.textContent = '';
    successMessage.classList.remove('error');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enquiry)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          Object.entries(data.errors).forEach(([fieldName, message]) => {
            const field = contactForm.elements[fieldName];
            if (field) {
              showError(field, message);
            }
          });
        }

        successMessage.classList.add('error');
        successMessage.textContent = data.message || 'Please check the form and try again.';
        return;
      }

      successMessage.textContent = data.message || 'Thank you! Your enquiry has been saved successfully.';
      contactForm.reset();
    } catch (error) {
      successMessage.classList.add('error');
      successMessage.textContent = 'Unable to save your enquiry. Start the backend server and try again.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Enquiry';
    }
  });
}
