# Publazer: Institutional E-Repository with Plagiarism Detection

**Publazer** is a web-based research repository designed for academic institutions. It streamlines the submission, review, and archiving of academic papers while providing an integrated plagiarism detection tool to ensure content integrity.

## 🚀 Features

- **User Role Management**: Secure authentication for Students, Faculty, and Admins.
- **Paper Submission System**: Students can upload research PDF files with metadata (abstract, keywords).
- **Automated Plagiarism Check**: Integrated scanning of uploaded documents for similarity analysis.
- **Institutional Repository**: A searchable digital library for approved research papers.
- **Review Workflow**: Faculty can review, approve, reject, and comment on submissions.
- **Real-time Notifications**: Alerts for submission status changes and review feedback.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **File Storage**: Cloudinary (for PDF storage)
- **Authentication**: JWT & Bcrypt

## 📂 Project Structure

Publazer-Thesis/
├── frontend/
│ └── research-hub/ # React Client Application
└── server/ # Node.js API Server

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas URI)
- Cloudinary Account (for file uploads)

## 1. Backend Setup (Server)

Navigate to the server directory and install dependencies:

```bash
cd server
npm install

Create a .env file in the server folder and add your credentials:

PORT=3001
MONGO_URI=mongodb+srv://<your_user>:<your_password>@cluster0.mongodb.net/publazer
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Start the backend server:

npm start

Or for development with auto-reload:

npx nodemon index.js / node index.js

## 2. Frontend Setup (Client)

Navigate to the frontend directory

cd frontend/research-hub
npm install

Start the development server:

npm run dev

The application should now be running...

