# SkillHub - Responsive Online Learning Platform

SkillHub is a responsive full-stack learning platform demo. It includes a landing page, course API, enquiry form backend, and persistent database storage.

## Project Topic
**SkillHub - Responsive Online Learning Platform Landing Page**

## Project Goal
Create a clean, user-friendly, responsive landing page for a simple web application where beginners can explore learning paths and send course enquiries.

## Pages / Sections
- Header with responsive navigation
- Hero section
- Learning dashboard preview
- Statistics section
- Features section
- Popular courses section
- Course filter buttons
- Learning roadmap
- Testimonial card
- FAQ accordion
- Contact form
- Footer

## Features
- Mobile-first responsive layout
- Hamburger menu on small screens
- Dark/light theme toggle
- Filterable course cards
- FAQ accordion
- Contact form validation
- Backend API for courses and enquiries
- Persistent database integration
- Semantic HTML landmarks
- Accessible form labels and focus states

## Tech Stack
- HTML5
- CSS3
- JavaScript
- Node.js
- Node HTTP API
- File-backed JSON database

## Folder Structure

```text
skillhub-responsive-interface/
|-- data/
|   `-- skillhub-db.json
|-- server/
|   |-- db.js
|   `-- server.js
|-- css/
|   `-- style.css
|-- js/
|   `-- script.js
|-- index.html
|-- package.json
`-- README.md
```

## Responsive Breakpoints
- Mobile: default styles
- Tablet: 768px and above
- Desktop: 1024px and above

## How to Run
1. Download or clone the project.
2. Install project metadata:
   ```bash
   npm install
   ```
3. Start the full-stack app:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in a browser.
5. Resize the browser or use developer tools to test mobile, tablet, and desktop screens.

## API Routes
- `GET /api/health` checks server and database status.
- `GET /api/courses` returns the courses saved in the database.
- `POST /api/enquiries` saves a new course enquiry.
- `GET /api/enquiries` lists saved enquiries for review.

## Testing Checklist
- [ ] Header navigation works on desktop
- [ ] Hamburger menu opens/closes on mobile
- [ ] Theme toggle changes theme
- [ ] Course filter buttons work
- [ ] FAQ accordion opens/closes
- [ ] Contact form shows validation messages
- [ ] Contact form saves enquiries to the database
- [ ] `GET /api/courses` returns seeded course data
- [ ] `GET /api/enquiries` returns submitted enquiries
- [ ] Layout is readable on mobile, tablet, and desktop
- [ ] Keyboard focus is visible

## Submission Notes
This project now includes a backend and database layer while keeping the original responsive frontend structure.
