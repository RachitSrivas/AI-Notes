# Peblo AI Notes Workspace

A lightweight, collaborative, and AI-powered notes workspace built for the Peblo Full Stack Developer Challenge. 

This application allows users to create, organize, and publically share notes while leveraging AI to instantly generate executive summaries, extract action items, and suggest intelligent titles.

## 🚀 Tech Stack

**Frontend:**
* React (via Vite)
* TypeScript
* Tailwind CSS (v4)
* React Router
* Lucide Icons

**Backend:**
* Node.js & Express
* TypeScript
* Prisma ORM (v7 with `adapter-pg`)
* PostgreSQL (via Supabase)
* JSON Web Tokens (JWT) & bcrypt for Auth
* Mistral AI SDK (`mistral-small-latest`)

---

## ✨ Features

* **Secure Authentication:** Complete JWT-based signup and login flow.
* **Frictionless Editing:** A clean, distraction-free writing canvas.
* **Debounced Auto-Save:** Changes are saved automatically to the database 1 second after the user stops typing, ensuring data is never lost without spamming the backend with unnecessary API calls.
* **Optimistic UI:** The frontend updates instantly as you type or organize notes, making the app feel incredibly fast and responsive.
* **AI Insights:** One-click integration with Mistral AI to analyze note content and return a structured JSON response containing a summary, action items, and a suggested title.
* **Public Sharing:** Instantly generate a read-only, public link for any note to share with non-authenticated users.
* **Productivity Dashboard:** A real-time analytics view tracking total notes, 7-day activity metrics, AI usage, and most-used tags.

---

## 🧠 Architecture & Product Decisions

1. **Database Schema:** Designed with relational integrity in mind. The `Note` model belongs to a `User`, ensuring data isolation. We utilized string arrays for tags to keep the MVP schema lightweight but easily searchable.
2. **AI Reliability:** LLMs can be unpredictable. The backend strictly prompts Mistral to return `responseFormat: { type: 'json_object' }` and validates the data type before sending it to the client, preventing frontend crashes from malformed AI text.
3. **Prisma v7 Driver Adapters:** Utilized the newest Prisma architecture (`@prisma/adapter-pg`) to ensure future-proof, serverless-ready database connections.
4. **State Management:** Handled locally within React via standard hooks to minimize overhead, with Axios interceptors automatically injecting the JWT bearer token into every authenticated request.

---

## 🛠️ Local Setup Instructions

Follow these steps to run the application locally on your machine.

### 1. Clone & Install Dependencies
First, clone the repository and install the packages for both the backend and frontend.


# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
2. Environment Variables
Create a .env file in the backend directory. You can copy the structure from .env.example:

Code snippet
# backend/.env
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[db]?schema=public"
JWT_SECRET="your_secure_random_string"
MISTRAL_API_KEY="your_mistral_api_key"
PORT=5000
3. Database Setup (Prisma)
Navigate to the backend folder and sync the Prisma schema with your PostgreSQL database:

Bash
cd backend
npx prisma generate
npx prisma db push
4. Run the Application
You will need two terminal windows open to run both servers simultaneously.

Terminal 1 (Backend):

Bash
cd backend
npm run dev
# Runs on http://localhost:5000
Terminal 2 (Frontend):

Bash
cd frontend
npm run dev
# Runs on http://localhost:5173
Navigate to http://localhost:5173 in your browser to start using the app!

📁 Repository Structure
/frontend - Contains the Vite/React application, routing, and UI components.

/src/api/axios.ts - Centralized API client with JWT interceptors.

/src/pages - Core views (Auth, Workspace, SharedNote).

/backend - Contains the Express server, REST API routes, and Prisma client.

/prisma/schema.prisma - Database schema definition.

/src/routes - Isolated API controllers (auth, notes, shared).



