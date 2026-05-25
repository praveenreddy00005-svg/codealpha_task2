# Event Registration System

Full-stack event registration platform with JWT authentication, role-based access (user, organizer, admin), event CRUD, capacity limits, and duplicate-registration prevention.

## Tech Stack

| Layer    | Technologies                          |
| -------- | ------------------------------------- |
| Backend  | Node.js, Express.js, MongoDB, Mongoose |
| Frontend | React, Vite, Tailwind CSS, React Router |
| Auth     | JWT (JSON Web Tokens)                 |

## Features

- User signup & login with JWT
- Browse, create, edit, and delete events
- Register for events with capacity limits
- View and cancel registrations
- Organizer/Admin event management dashboard
- Duplicate registration prevention
- Protected routes & form validation
- Responsive modern UI

## Project Structure

```
event-registration-system/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/          # Database connection
│       ├── controllers/     # Request handlers (MVC)
│       ├── middleware/      # Auth, validation, errors
│       ├── models/          # Mongoose schemas
│       ├── routes/          # API routes
│       ├── utils/           # Helpers
│       ├── app.js           # Express app setup
│       ├── server.js        # Entry point
│       └── seed.js          # Sample data
├── frontend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── components/      # Reusable UI
│       ├── context/         # Auth state
│       ├── pages/           # Route pages
│       ├── services/        # API client
│       ├── App.jsx
│       └── main.jsx
├── postman/
│   └── Event-Registration-API.postman_collection.json
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (or MongoDB Atlas URI)

## Quick Start

### 1. Clone & install dependencies

```bash
npm run install:all
```

Or install separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

**Backend** — copy and edit:

```bash
cp backend/.env.example backend/.env
```

**Frontend** — copy and edit:

```bash
cp frontend/.env.example frontend/.env
```

### 3. Seed the database

```bash
npm run seed
```

### 4. Run the application

**Option A — both servers:**

```bash
npm run dev
```

**Option B — separate terminals:**

```bash
npm run backend    # http://localhost:5000
npm run frontend   # http://localhost:5173
```

## Test Accounts (after seeding)

| Role      | Email                 | Password      |
| --------- | --------------------- | ------------- |
| Admin     | admin@events.com      | admin123      |
| Organizer | organizer@events.com  | organizer123  |
| User      | user@events.com       | user1234      |

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint    | Access | Description        |
| ------ | ----------- | ------ | ------------------ |
| POST   | `/register` | Public | Register new user  |
| POST   | `/login`    | Public | Login & get JWT    |
| GET    | `/me`       | Auth   | Get current user   |

### Events (`/api/events`)

| Method | Endpoint  | Access            | Description          |
| ------ | --------- | ----------------- | -------------------- |
| GET    | `/`       | Public            | List published events |
| GET    | `/:id`    | Public            | Get event by ID      |
| GET    | `/mine`   | Organizer/Admin   | List managed events  |
| POST   | `/`       | Organizer/Admin   | Create event         |
| PUT    | `/:id`    | Organizer/Admin   | Update event         |
| DELETE | `/:id`    | Organizer/Admin   | Delete event         |

### Registrations (`/api/registrations`)

| Method | Endpoint          | Access          | Description              |
| ------ | ----------------- | --------------- | ------------------------ |
| POST   | `/`               | Auth (user)     | Register for event       |
| GET    | `/my`             | Auth            | My registrations         |
| DELETE | `/:id`            | Auth            | Cancel registration      |
| GET    | `/event/:eventId` | Organizer/Admin | Event attendee list      |

> Protected routes require header: `Authorization: Bearer <token>`

## Frontend Pages

| Route           | Page              | Access              |
| --------------- | ----------------- | ------------------- |
| `/`             | Home              | Public              |
| `/events`       | Events List       | Public              |
| `/events/:id`   | Event Details     | Public              |
| `/login`        | Login             | Public              |
| `/register`     | Register          | Public              |
| `/dashboard`    | User Dashboard    | Authenticated       |
| `/admin`        | Admin Dashboard   | Organizer / Admin   |

## Postman Collection

Import `postman/Event-Registration-API.postman_collection.json` into Postman.

1. Run the seed script to populate test data
2. Use **Auth → Login** to obtain a token (saved automatically via collection variable)
3. Test Events and Registrations endpoints

## MongoDB Models

### User
- `name`, `email`, `password` (hashed), `role` (`user` | `organizer` | `admin`)

### Event
- `title`, `description`, `date`, `location`, `capacity`, `registeredCount`, `organizer`, `imageUrl`, `isPublished`

### Registration
- `user`, `event`, `status` (`confirmed` | `cancelled`)
- Unique compound index on `(user, event)` prevents duplicates

## License

MIT
