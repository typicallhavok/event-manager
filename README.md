# Event Manager

A modern event management platform built with React and Node.js, featuring real-time updates and an intuitive interface.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Socket.io client for real-time features
- React Router for navigation
- Axios for API requests

### Backend
- Node.js & Express
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication
- bcrypt for password hashing

## Features

- **User Authentication**
  - Sign up/Sign in functionality
  - JWT-based session management
  - Protected routes

- **Event Management**
  - Create and edit events
  - Rich text event descriptions
  - Custom registration button text
  - Event status tracking (draft/published/cancelled)

- **Real-time Updates**
  - Live attendee count updates
  - Instant registration notifications
  - Real-time event modifications

- **Event Discovery**
  - Users can browse events without logging in (guest functionality)
  - Browse upcoming events
  - Filter events by date
  - Search functionality
  - Past events archive

- **User Dashboard**
  - View created events
  - Track registered events
  - Manage event details

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/event-manager.git
cd event-manager
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up environment variables:

Frontend (.env):
```env
VITE_BACKEND_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

Backend (.env):
```env
MONGODB_URI=mongodb://localhost:27017/event-manager
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
```

4. Start the development servers:
```bash
# Backend
cd backend
npm run dev

# Frontend (in a new terminal)
cd frontend
npm run dev
```

## Test Credentials

Use these credentials to test the application:

```
username: dev@test.com
password: tester
```

## Deployment
-  Frontend Hosting: Vercel.
-  Backend Hosting: Render.
-  Database: MongoDB Atlas.

## API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - Create new user account
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Event Endpoints
- GET `/api/events` - List all events
- POST `/api/events/create` - Create new event
- GET `/api/events/:id` - Get event details
- PUT `/api/events/:id` - Update event
- POST `/api/events/:id/register` - Register for event

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

