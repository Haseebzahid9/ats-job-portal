# 🏢 ATS Job Portal
### Multi-Branch Recruitment & Applicant Tracking System

> **BSCS Semester Project — Web Development | BSCS 6F & 8F**  
> **Developer:** Haseeb Zahid | 03184006367

A full-stack web application that automates the complete hiring process for a multi-branch software company. Candidates apply for jobs and track their application status. HR/Admin manages jobs, applicants, and schedules interviews — all with automatic email notifications.

---

## 🔗 Live Demo

| | URL |
|--|--|
| 🌐 **Frontend** | https://ats-job-portal.vercel.app |
| ⚙️ **Backend API** | https://ats-job-portal-production.up.railway.app |
| 📦 **GitHub** | https://github.com/Haseebzahid9/ats-job-portal |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| File Storage | Cloudinary |
| Authentication | JWT (JSON Web Tokens) |
| Email Service | Gmail SMTP (Nodemailer) |
| HTTP Client | Axios |
| Deployment | Vercel (Frontend) + Railway (Backend) |

---

## ✅ Features

### 👤 Candidate Portal
- Register & Login with JWT authentication
- Edit profile (name, phone, CNIC, department, branch)
- Upload profile picture via Cloudinary
- Upload Resume (PDF) via Cloudinary
- Apply for jobs with resume + optional cover letter
- View all applied jobs and track status in real time
- Receive email notifications on every status update

### 🏢 HR / Admin Portal
- View and manage all job applications
- Shortlist, reject, or select candidates
- Schedule interviews (date, time, online/in-person, meeting link, notes)
- Send automatic email notifications to candidates
- Add / Edit / Delete job postings
- Set job branch, department, seats, and deadline

### 🌍 Public Career Portal
- Browse all active job listings
- Filter jobs by branch or department
- View full job details and apply online

### 📧 Automatic Email Notifications
- ✅ Application submitted confirmation
- ✅ Shortlisted notification
- ✅ Interview scheduled with full details
- ✅ Rejection notification
- ✅ Selected / offer notification

### 📊 Application Status Flow
```
Submitted → Under Review → Shortlisted → Interview Scheduled → Selected
                                       ↘ Rejected
```

---

## 📁 Project Structure

```
ats-job-portal/
├── backend/
│   ├── config/
│   │   ├── db.js                    # MongoDB Atlas connection
│   │   ├── cloudinary.js            # Cloudinary configuration
│   │   └── email.js                 # Gmail SMTP transporter
│   ├── controllers/
│   │   ├── application_controller.js
│   │   ├── auth_controller.js
│   │   ├── interview_controller.js
│   │   ├── job_controller.js
│   │   └── contact_controller.js
│   ├── middleware/
│   │   ├── auth_middleware.js        # JWT token verification
│   │   ├── role_middleware.js        # Role-based access control
│   │   └── upload_middleware.js      # Multer + Cloudinary upload
│   ├── models/
│   │   ├── application_model.js
│   │   ├── branch_model.js
│   │   ├── interview_model.js
│   │   ├── job_model.js
│   │   └── user_model.js
│   ├── routes/
│   │   ├── application_routes.js
│   │   ├── auth_routes.js
│   │   ├── contact_routes.js
│   │   ├── interview_routes.js
│   │   ├── job_routes.js
│   │   └── upload_routes.js
│   ├── utils/
│   │   ├── send_email.js
│   │   └── seed.js
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/                  # Auth context (global state)
    │   ├── hooks/
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx    # HR/Admin panel
    │   │   ├── Dashboard.jsx         # Candidate dashboard
    │   │   ├── Home.jsx
    │   │   ├── Jobs.jsx
    │   │   ├── JobDetails.jsx        # Job detail + apply modal
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Contact.jsx
    │   │   └── SuccessStories.jsx
    │   ├── routes/                   # Protected route wrappers
    │   ├── services/
    │   │   ├── api.js                # Axios instance with interceptors
    │   │   ├── auth_service.js
    │   │   ├── application_service.js
    │   │   ├── interview_service.js
    │   │   └── job_service.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .gitignore
    └── package.json
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://mongodb.com/cloud/atlas) account (free)
- [Cloudinary](https://cloudinary.com) account (free)
- Gmail account with App Password enabled

---

## 🚀 Local Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Haseebzahid9/ats-job-portal.git
cd ats-job-portal
```

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/ats_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Run the backend:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
Email transporter ready
```

### Step 3 — Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the frontend:
```bash
npm run dev
```

Open in browser: `http://localhost:5173`

---

## 🔑 Getting Environment Variable Values

### MongoDB Atlas
1. Go to https://mongodb.com/cloud/atlas → create free cluster
2. **Database Access** → Add user with username & password
3. **Network Access** → Allow from anywhere (`0.0.0.0/0`)
4. **Connect** → Connect your application → copy the connection string
5. Replace `<password>` with your actual password

### Cloudinary
1. Go to https://cloudinary.com → create free account
2. Dashboard → copy `Cloud Name`, `API Key`, `API Secret`

### Gmail App Password
1. Go to https://myaccount.google.com
2. Security → Enable **2-Step Verification**
3. Search **App Passwords** → generate one for "Mail"
4. Copy the 16-character password — use as `GMAIL_APP_PASSWORD`

---

## 📡 API Reference

### Auth Routes `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT token |
| GET | `/me` | Private | Get current user info |
| PUT | `/profile` | Private | Update profile details |
| PUT | `/profile/resume` | Candidate | Upload resume to Cloudinary |
| PUT | `/profile/picture` | Private | Upload profile picture |
| PUT | `/change-password` | Private | Change password |

### Job Routes `/api/jobs`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all active jobs |
| GET | `/:id` | Public | Get single job |
| POST | `/` | HR/Admin | Create new job |
| PUT | `/:id` | HR/Admin | Update job |
| DELETE | `/:id` | HR/Admin | Delete job |

### Application Routes `/api/applications`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Candidate | Apply for a job |
| GET | `/my` | Candidate | My applications |
| GET | `/` | HR/Admin | All applications |
| GET | `/job/:jobId` | HR/Admin | Applications for a job |
| PUT | `/:id/status` | HR/Admin | Update status + send email |

### Interview Routes `/api/interviews`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/schedule` | HR/Admin | Schedule interview |
| GET | `/` | HR/Admin | All interviews |
| GET | `/my` | Candidate | My interviews |

---

## 👥 User Roles

| Role | Access |
|------|--------|
| `candidate` | Apply for jobs, track status, upload resume |
| `hr` | Manage applications, post jobs, schedule interviews |
| `admin` | Full access to everything |

> **To create admin account:** Register normally → go to MongoDB Atlas → Users collection → find your document → change `role` to `"admin"` → save.

---

## 🌐 Deployment Guide

### Backend on Railway
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select `ats-job-portal` repo
3. Set **Root Directory** to `backend` in Settings
4. Add all environment variables in Variables tab
5. Generate domain in Settings → Networking

### Frontend on Vercel
1. Go to https://vercel.com → Add New Project
2. Import `ats-job-portal` from GitHub
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-railway-url.railway.app/api`
5. Deploy

### After Deploying — Update CORS
In `backend/server.js`, add your Vercel URL:
```js
origin: [
  'http://localhost:5173',
  'https://ats-job-portal.vercel.app',
],
```
Push to GitHub — Railway auto-redeploys.

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Blank page on Vercel | Check `VITE_API_URL` is set in Vercel environment variables |
| Login/Register failing | Check CORS — add Vercel URL to backend server.js |
| Email not sending | Check `GMAIL_USER` and `GMAIL_APP_PASSWORD` in Railway variables |
| Resume upload failing | Check Cloudinary credentials in Railway variables |
| MongoDB not connecting | Whitelist `0.0.0.0/0` in Atlas Network Access |
| JWT errors | Clear browser localStorage and login again |

---

## 🔄 Git Commands Reference

```bash
# Check what changed
git status

# Stage all changes
git add .

# Commit with message
git commit -m "feat: describe what you added or fixed"

# Push to GitHub
git push

# View commit history
git log --oneline
```

---

## 👨‍💻 Developer

**Haseeb Zahid**
- GitHub: [@Haseebzahid9](https://github.com/Haseebzahid9)
- Contact: 03184006367

---

*BSCS Semester Project — Web Development | Haseeb Zahid © 2026*
