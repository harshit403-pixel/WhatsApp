# WhatsApp Desktop Clone

A production-style real-time chat application inspired by WhatsApp Web/Desktop, built with the MERN stack and Socket.IO.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black?logo=socket.io)
![Redis](https://img.shields.io/badge/Redis-Cache-red?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)

---

## Features

### Authentication
- User registration and login
- JWT Authentication
- Refresh Token flow
- Protected routes
- Persistent sessions
- Logout functionality

### Real-Time Chat
- One-to-one messaging
- Real-time message delivery
- Typing indicators
- Online/offline presence
- Read receipts
- Delivery receipts
- Unread message counts
- Optimistic UI updates

### Group Chats
- Create groups
- Add members
- Remove members
- Rename groups
- Leave groups
- Group information drawer

### User Experience
- Modern glassmorphism UI
- Dark mode interface
- Responsive design
- Real-time updates with Socket.IO
- Toast notifications
- Smooth animations with Framer Motion
- Skeleton loaders
- Search users and conversations

---

# Tech Stack

## Frontend
- React 19
- Redux Toolkit
- React Router
- Tailwind CSS v4
- Axios
- Framer Motion
- Socket.IO Client
- Sonner Toasts
- Lucide Icons

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- Socket.IO
- JWT
- bcryptjs
- Zod Validation

## DevOps
- Docker
- Docker Compose

---

# Project Structure

```bash
.
├── Frontend
│   ├── src
│   │   ├── app
│   │   ├── features
│   │   │   ├── auth
│   │   │   ├── chats
│   │   │   └── shared
│   │   └── main.jsx
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── dao
│   │   ├── middlewares
│   │   ├── models
│   │   ├── routes
│   │   ├── sockets
│   │   ├── utils
│   │   └── validators
│   └── server.js
│
└── docker-compose.yml
```

---

# Architecture

```text
React + Redux
        │
        ▼
     Axios APIs
        │
        ▼
   Express Server
        │
        ▼
 MongoDB + Redis
        │
        ▼
     Socket.IO
        │
        ▼
 Real-time Messaging
```

---

# Environment Variables

## Backend `.env`

```env
PORT=3000
NODE_ENV=development

MONGODB_URI=

JWT_SECRET=
JWT_EXPIRES_IN=15m

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=7d

REDIS_HOST=redis
REDIS_PORT=6379

CLIENT_URL=http://localhost:5173
```

---

## Frontend `.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/whatsapp-clone.git
cd whatsapp-clone
```

---

# Run With Docker

```bash
docker compose up --build
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

Redis:

```text
localhost:6379
```

---

# Run Locally

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

# Real-Time Features

### Message Lifecycle

```text
Sending
   ↓
Saved
   ↓
Delivered
   ↓
Read
```

### Socket Events

```text
message:send
message:new
message:delivered
message:read

typing:start
typing:stop

user:online
user:offline

group:created
group:updated
```



# Future Improvements

- Voice and video calls
- File sharing
- Message reactions
- Reply and forward messages
- Message deletion
- Pinned chats
- Archived chats
- Push notifications
- End-to-end encryption
- Message search
- Media gallery

---

# Learning Outcomes

This project helped in understanding:

- Scalable MERN architecture
- Authentication with JWT and Refresh Tokens
- Real-time communication using Socket.IO
- State management using Redux Toolkit
- Presence systems using Redis
- Dockerized development workflow
- Production-style folder structures
- Optimistic UI patterns

---

# Author

**Harshit Raghuwanshi**

- GitHub: https://github.com/your-username
- LinkedIn: https://linkedin.com/in/your-profile

---

# License

This project is licensed under the MIT License.

---

⭐ If you liked the project, consider giving it a star.
