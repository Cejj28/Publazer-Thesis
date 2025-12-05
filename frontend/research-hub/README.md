# PUBLAZER - Academic Repository & Plagiarism Detection System

## 📖 Overview
PUBLAZER is a web-based research repository designed for USTP. It allows students to archive their thesis papers and allows faculty to detect plagiarism against the internal repository database.

## ✨ Key Features
- **Research Repository:** View, search, and download approved academic papers.
- **Plagiarism Checker:** Scans uploaded PDFs or text against the internal database using string similarity algorithms.
- **Role-Based Access:** - **Students:** Upload papers, view own submissions.
  - **Admins:** Approve/Reject papers, Manage Users, Delete records.
- **Cloud Storage:** Integrated with Cloudinary for reliable PDF hosting.

## 🛠 Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (NoSQL).
- **File Storage:** Cloudinary.
- **Security:** Bcrypt encryption for passwords.

## 🚀 Setup & Installation
1. **Clone the repository**
2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   node index.js