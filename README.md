# Task Management

## First clone the project## Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/sudhakar-k47/task-management.git

## Navigate to the frontend directory.
cd frontend

## Install the necessary dependencies.
npm i

## Start the development server with auto-reloading and an instant preview.
npm run dev

## Navigate to the backend directory.
cd backend

## Install the necessary dependencies.
npm i

## Start the development server with auto-reloading and an instant preview.
npm run start

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- Node.js
- Express.js
- Postgres

## 🏗️ Architecture Diagram

    Frontend[React (Vite)] --API/Socket--> Backend[Node/Express]
    Backend --Postgres--> Database[(PostgreSQL)]
    Backend --Redis--> Queue[(Redis)]
    Backend --Socket.IO--> Frontend
    Backend --Workers--> ImageWorker & EmailWorker
    ImageWorker --uploads--> FileSystem
    EmailWorker --SMTP--> EmailServer

## 📬 API Examples

### Create Task (with images)
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test",
    "priority": "high",
    "processing_type": "image",
    "images": ["<base64_image1>", "<base64_image2>"]
  }'
```

### Get All Tasks
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>"
```

---

## 🔗 Postman Collection

You can import the following endpoints into Postman:
Tasks:
- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/:id` - Get task details
- `DELETE /api/tasks/:id` - Delete the task 

Users:
- `POST /api/users` - Create a new user
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `DELETE /api/users/:id` - Delete the user 

---

## 🎥 Demo Video

https://drive.google.com/file/d/1TCn9VFmmcLBIBhiusYdXEoEBZOxNaoMb/view?usp=drive_link



