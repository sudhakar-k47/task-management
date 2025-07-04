
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui

---

## 🐳 Docker Compose Setup

A `docker-compose.yml` is provided at the root of the project. It spins up:
- PostgreSQL (DB)
- Redis (Queue)
- Backend (Express/Node)
- Frontend (Vite/React)

To start everything:
```sh
docker-compose up --build
```

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    Frontend[React (Vite)] --API/Socket--> Backend[Node/Express]
    Backend --Postgres--> Database[(PostgreSQL)]
    Backend --Redis--> Queue[(Redis)]
    Backend --Socket.IO--> Frontend
    Backend --Workers--> ImageWorker & EmailWorker
    ImageWorker --uploads--> FileSystem
    EmailWorker --SMTP--> EmailServer
```

---

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
- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/:id` - Get task details

---

## 🎥 Demo Video

_A short demo (≤ 5 min) should be added here. Upload your video to a sharing service (e.g., Google Drive, YouTube) and link it below._

**[Demo Video Link - Add Here]**

---
- Tailwind CSS


