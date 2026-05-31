# FACREC - Face Recognition System

A real-time Face Recognition System built using **Python**, **OpenCV**, **NumPy**, and **K-Nearest Neighbors (KNN)**. This project captures facial data from a webcam, trains a recognition model using stored face datasets, and identifies faces in real time.

---

## 📌 Features

- Real-time face detection using Haar Cascade Classifier
- Face dataset collection from webcam
- Face recognition using K-Nearest Neighbors (KNN)
- Multiple user support
- Fast and lightweight implementation
- Easy to extend with advanced ML/DL models

---

## 🛠️ Technologies Used

- Python
- OpenCV
- NumPy
- Machine Learning (KNN Algorithm)

---

## 📂 Project Structure

```
FACREC/
│
├── facial_data.py          # Face data collection script
├── face_recognition.py     # Face recognition script
├── face_dataset/           # Stored face datasets (.npy files)
├── data.xml                # Haar Cascade XML file
├── README.md
│
└── requirements.txt
```

---

## ⚙️ Installation

### 1. Install Dependencies

```bash
pip install opencv-python numpy
```

Or

```bash
pip install -r requirements.txt
```

---

## 📸 Step 1: Collect Face Data

Run:

```bash
python facial_data.py
```

Enter your name when prompted:

```text
Enter the name of person : MITHESH
```

The program will:

- Open webcam
- Detect face
- Capture multiple face samples
- Save dataset in `face_dataset/`

---

## 🤖 Step 2: Run Face Recognition

Run:

```bash
python face_recognition.py
```

The system will:

- Load all saved face datasets
- Train KNN model
- Start webcam
- Detect and recognize faces in real time

---

## 🧠 How It Works

### Face Detection

The project uses OpenCV's Haar Cascade classifier:

```python
data.xml
```

to detect faces from webcam frames.

### Face Dataset Creation

Detected faces are:

- Cropped
- Resized
- Flattened into feature vectors
- Stored as `.npy` files

### Face Recognition

Recognition is performed using:

### K-Nearest Neighbors (KNN)

Steps:

1. Calculate Euclidean distance
2. Find nearest neighbors
3. Majority voting
4. Predict identity

---

## 📊 Algorithm Used

### Euclidean Distance

\[
Distance = \sqrt{\sum (x_i - y_i)^2}
\]

Used to measure similarity between facial feature vectors.

---

## 📁 Dataset Format

Example:

```text
face_dataset/
│
├── MITHESH.npy
├── ASHOK.npy
├── VIKRAM.npy
```

Each file stores facial feature vectors for a specific person.

---

## 🚀 Future Improvements

- Deep Learning based Face Recognition
- Face Mask Detection
- Attendance Management System
- GUI Application
- Database Integration
- Cloud Deployment

---
