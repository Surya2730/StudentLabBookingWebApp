# Student Lab Slot Booking & Attendance System

A comprehensive MERN stack application for managing university lab slots, enabling students to book sessions and faculty to manage attendance via OTP.

## 🚀 Features

### for Students
- **Department-Specific View**: Automatically filters lab slots based on your department (CSE, ECE, EEE).
- **Easy Booking**: One-click booking for available slots.
- **Real-Time Status**: See "Booked" or "Full" status instantly.
- **Attendance**: Mark attendance using a secure 6-digit OTP provided by faculty.
- **My Bookings**: View history of all your booked sessions.

### For Faculty
- **Slot Management**: Create, view, and delete lab slots.
- **Department Control**: Assign slots to specific departments.
- **Live Attendance**: Generate a 15-second expiring OTP for secure student attendance.
- **Student Tracking**: View list of booked students and assign marks.

### Authentication
- **Google Login**: Seamless sign-in with Google.
- **Dynamic Role Switching**: Smart profile management allows users to switch roles/departments for testing.
- **Dev Login**: Built-in mock login for development and testing without credentials.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Ant Design
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, Google OAuth 2.0
- **Notifications**: Nodemailer (Email)

## 📦 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Surya2730/StudentLabBookingWebApp.git
    cd StudentLabBookingWebApp
    ```

2.  **Install Server Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies**
    ```bash
    cd ../client
    npm install
    ```

4.  **Environment Setup**
    - Create a `.env` file in the `server` directory (use `.env.example` as a template).
    - Add your MongoDB URI (`mongodb://localhost:27017/student_lab_booking`).
    - Add Google Client ID (optional for Dev Login).

5.  **Run the Application**
    - **Server**: `cd server && npm start`
    - **Client**: `cd client && npm run dev`

## 🔑 Usage Guide

### Simulation Mode (Testing)
To test both roles simultaneously:
1.  **Faculty**: Open Chrome -> Login as Faculty -> Create Slot.
2.  **Student**: Open Incognito Window -> Login as Student (different email) -> Book Slot.

### Deployment
The frontend is built with Vite and can be deployed to Vercel/Netlify. The backend requires a Node.js environment (Render/Heroku/Railway).
