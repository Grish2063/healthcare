# Healthcare Management System

A React-based healthcare management dashboard for handling patients, appointments, and medical records — built with React, Vite, and Tailwind CSS.

## Features

- **Dashboard Overview** — at-a-glance stats for total patients, today's appointments, and pending tasks
- **Patient Management** — add new patients via a modal form, with activity logged automatically
- **Appointment Scheduling** — book new appointments and track them on the dashboard
- **Record Uploads** — upload and attach medical records to patient profiles
- **Recent Activity Feed** — a live-updating log of registrations, completed appointments, and uploads
- **Authentication** — protected dashboard routes with login/logout via context-based auth

## Tech Stack

- **React** — component-based UI
- **Vite** — build tool and dev server
- **React Router** — client-side routing
- **Tailwind CSS** — utility-first styling
- **ESLint** — code linting

## Project Structure

```
healthcare/
├── public/              # Static assets
├── src/
│   ├── components/      # Dashboard, modals (AddPatient, NewAppointment, UploadRecord), etc.
│   ├── context/          # AuthContext and other React context providers
│   └── ...
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Installation

```bash
git clone https://github.com/Grish2063/healthcare.git
cd healthcare
npm install
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Roadmap

- [ ] Reports view (currently disabled on the dashboard)
- [ ] Persist data to a backend/database instead of local state
- [ ] Expand patient and appointment detail views

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open a pull request or file an issue.

## License

No license specified yet.
