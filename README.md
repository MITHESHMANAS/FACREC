# 🎓 FACREC – Face Recognition Attendance Management System

> A modular Face Recognition Attendance Management System built using Python, OpenCV, SQLite, and Tkinter with a service-oriented architecture.

---

## 📌 Overview

FACREC is a desktop-based attendance management system that automates student attendance using real-time face recognition. The system captures student face datasets, recognizes students through a webcam using a K-Nearest Neighbors (KNN) classifier, and records attendance into an SQLite database.

The project follows a modular service-layer architecture to improve maintainability, readability, and scalability.

---

# ✨ Features

- 🔐 Secure Login System
- 👨‍🎓 Student Registration
- 📷 Face Dataset Collection
- 🤖 Real-Time Face Recognition
- ✅ Automatic Attendance Marking
- 👤 Student Profile Search
- 📊 Attendance Percentage Analysis
- ⚠️ Attendance Shortage Report
- 📈 Dashboard Analytics
- 📄 PDF Attendance Report
- 🥧 Attendance Pie Chart
- 📊 Attendance Bar Chart

---

# 🛠 Tech Stack

### Programming Language
- Python

### Computer Vision
- OpenCV
- Haar Cascade Classifier

### Machine Learning
- K-Nearest Neighbors (KNN)

### Database
- SQLite

### GUI
- Tkinter

### Visualization
- Matplotlib

### PDF Generation
- ReportLab

---

# 📂 Project Structure

```
FACREC/
│
├── services/
│   ├── auth_service.py
│   ├── student_service.py
│   ├── attendance_service.py
│   ├── dataset_service.py
│   ├── recognition_service.py
│   ├── report_service.py
│   └── face_service.py
│
├── face_dataset/
├── reports/
├── attendance/
│
├── login.py
├── dashboard.py
├── face_data.py
├── face_recognition.py
├── student_profile.py
├── database.py
├── attendance.db
└── README.md
```

---

# 🏗 Architecture

```
                Login
                  │
                  ▼
             Dashboard
                  │
   ┌──────────────┼──────────────┐
   ▼              ▼              ▼
Students     Attendance     Face Recognition
   │              │              │
   ▼              ▼              ▼
student_service attendance_service recognition_service
                  │
                  ▼
             database.py
                  │
                  ▼
               SQLite
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/MITHESHMANAS/FACREC.git
```

Go to the project folder

```bash
cd FACREC
```

Install dependencies

```bash
pip install opencv-python numpy matplotlib reportlab
```

Run the application

```bash
python login.py
```

---

# 📷 Workflow

1. Login
2. Register Student
3. Capture Face Dataset
4. Start Face Recognition
5. Attendance Stored in SQLite
6. View Analytics & Reports

---

# 📊 Reports

- Attendance Report
- Attendance Percentage
- Attendance Shortage
- Dashboard Statistics
- Pie Chart
- Bar Chart
- PDF Report

---

# 💡 Future Enhancements

- Deep Learning Face Recognition (FaceNet / ArcFace)
- MySQL/PostgreSQL Support
- Flask/Django Web Version
- Email Notifications
- QR Code Attendance
- Cloud Database Integration
- REST API
- Mobile Application

---
