# FACREC — Face Recognition Attendance ERP

FACREC is an enterprise-style Attendance Management System that automates classroom attendance using real-time face recognition. Built with React, Express, MongoDB, Socket.IO, and Python OpenCV, the system streamlines academic administration by eliminating manual attendance while providing comprehensive reporting, analytics, and recognition audit trails.

Unlike a standalone face recognition project, FACREC models the complete academic workflow followed in educational institutions—from student enrollment and faculty assignment to live attendance sessions, automated absence calculation, and report generation.

---

## Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

### Vision Module
- Python
- OpenCV
- Haar Cascade
- KNN Face Recognition
- NumPy

---

## Core Features

### Academic Management

- Student Management
- Faculty Management
- Subject Management
- Student Subject Enrollment
- Faculty Subject Assignment

### Attendance Management

- Session Scheduling
- Live Attendance Sessions
- Automatic Face Recognition Attendance
- Manual Attendance Support
- Attendance History
- Attendance Reports

### Face Recognition

- Live Webcam Recognition
- Haar Cascade Face Detection
- KNN Face Matching
- Face Dataset Registration
- Unknown Face Detection
- Confidence Scoring
- Recognition Time Tracking
- Bounding Box Snapshots
- Recognition Audit Logs

### Reports & Analytics

- Attendance Percentage
- Subject-wise Analytics
- Branch-wise Analytics
- Weekly Attendance Trends
- Students Below 75% Attendance
- Recognition Accuracy
- PDF Report Export
- Excel Report Export

### Enterprise Features

- JWT Authentication
- Role-Based Access Control
- REST API Architecture
- Socket.IO Live Updates
- Modular Backend Design
- Responsive Dashboard
- MongoDB Integration

---

## System Workflow

```
Admin
│
├── Create Students
├── Create Faculty
├── Create Subjects
├── Assign Faculty to Subjects
├── Enroll Students
└── Schedule Attendance Sessions

                ↓

Faculty

Open Session
        ↓
Start Session
        ↓
Launch Face Recognition
        ↓
Students Recognized
        ↓
Attendance Recorded
        ↓
End Session
        ↓
Automatic Absent Calculation

                ↓

Reports & Analytics

Attendance Reports
Recognition History
Attendance Statistics
PDF / Excel Export
```

---

## Attendance Flow

```
Admin Creates Session
          │
          ▼
Faculty Starts Session
          │
          ▼
Python Face Recognition
          │
          ▼
Student Identified
          │
          ▼
Attendance API
          │
          ▼
MongoDB Attendance
          │
          ▼
Faculty Ends Session
          │
          ▼
Absent Students Generated Automatically
          │
          ▼
Reports & Analytics Updated
```

---

## Project Structure

```
FACREC/

├── client/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   ├── scripts/
│   └── package.json
│
├── services/
│   ├── dataset_service.py
│   ├── face_service.py
│   └── recognition_service.py
│
├── face_dataset/
│
├── face_recognition.py
├── register_student.py
├── requirements.txt
│
├── docs/
│   ├── API_DOCS.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── ER_DIAGRAM.md
│   ├── SEQUENCE_DIAGRAM.md
│   └── VISION_INTEGRATION.md
│
└── README.md
```

---

## User Roles

### Administrator

- Dashboard
- Students
- Faculty
- Subjects
- Enrollments
- Faculty Assignments
- Sessions
- Attendance
- Recognition History
- Reports

### Faculty

- Dashboard
- Sessions
- Attendance
- Recognition History
- Reports

Faculty can:

- Start Attendance Sessions
- End Sessions
- Launch Face Recognition
- View Attendance Reports

### Student

- Dashboard
- Personal Profile
- Attendance Reports

---

## Quick Start

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Setup Backend

```bash
cd server

npm install

cp .env.example .env
```

Configure `.env`

```
PORT=

MONGODB_URI=

JWT_SECRET=
```

### Seed Database

```bash
npm run seed
```

### Default Login Accounts

┌─────────────────────────────────────────────────────────────────────────────────────┐
│  DEFAULT LOGIN ACCOUNTS                                                            │
├───────────────────────────────┬─────────────────────────────┬──────────────────────┤
│  ROLE                         │  EMAIL                      │  PASSWORD            │
├───────────────────────────────┼─────────────────────────────┼──────────────────────┤
│  Administrator                │  admin@facrec.edu          │  Facrec@123         │
│  Faculty                      │  ananya.rao@facrec.edu     │  Facrec@123         │
│  Faculty                      │  vikram.shah@facrec.edu    │  Facrec@123         │
└───────────────────────────────┴─────────────────────────────┴──────────────────────┘
### Start Backend

```bash
npm run dev
```

### Start Frontend

```bash
cd client

npm install

npm run dev
```

---

## Documentation

┌─────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENTATION                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│   ARCHITECTURE.md      – Overall system architecture and request flow            │
│   API_DOCS.md          – REST API documentation                                  │
│   ER_DIAGRAM.md        – Database schema and relationships                       │
│   SEQUENCE_DIAGRAM.md  – Recognition and attendance workflow                     │
│   DEPLOYMENT.md        – Installation and deployment guide                       │
│   VISION_INTEGRATION.md – Python vision module integration                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

## Key Functionalities

- Real-Time Face Recognition Attendance
- Automatic Attendance Recording
- Automatic Absent Student Calculation
- Student Subject Enrollment
- Faculty Subject Assignment
- Attendance Session Management
- Recognition Audit Trail
- PDF & Excel Report Generation
- Live Dashboard Updates
- Attendance Analytics

---


## Future Enhancements

- Deep Learning Face Recognition (FaceNet / InsightFace)
- Continuous Multi-Face Recognition
- Mobile Application
- Docker Deployment
- CI/CD Pipeline
- Multi-Campus Support
- Cloud Storage Integration
- QR Attendance Backup

---

## Developed By

**Mithesh Manas**

---

## License

This project is licensed under the MIT License.
