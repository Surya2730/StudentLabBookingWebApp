import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import FacultyHome from './pages/FacultyHome';
import FacultySlots from './pages/FacultySlots';
import FacultyPoints from './pages/FacultyPoints';
import FacultyTimetable from './pages/FacultyTimetable';
import StudentDashboard from './pages/StudentDashboard';
import LabBooking from './pages/LabBooking';
import AttendancePage from './pages/AttendancePage';
import TimetablePage from './pages/TimetablePage';
import ProfilePage from './pages/ProfilePage';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { Spin } from 'antd';
import { AuthContext } from './context/AuthContext';

const App = () => {
    const { loading, user } = useContext(AuthContext);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Loading App..." />
            </div>
        );
    }

    return (
        <Routes>

            <Route
                path="/login"
                element={
                    user ? (
                        user.role === 'faculty' || user.role === 'admin'
                            ? <Navigate to="/faculty/home" replace />
                            : <Navigate to="/student-dashboard" replace />
                    ) : (
                        <AuthLayout>
                            <Login />
                        </AuthLayout>
                    )
                }
            />

            {/* Entry Point */}
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            {/* Landing Page */}
            <Route path="/home" element={<Home />} />

            {/* Private Routes */}
            <Route
                element={
                    user ? <MainLayout /> : <Navigate to="/login" replace />
                }
            >
                {/* Student */}
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/lab-booking" element={<LabBooking />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/timetable" element={<TimetablePage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Faculty */}
                <Route path="/faculty/home" element={<FacultyHome />} />
                <Route path="/faculty/slots" element={<FacultySlots />} />
                <Route path="/faculty/points" element={<FacultyPoints />} />
                <Route path="/faculty/timetable" element={<FacultyTimetable />} />
            </Route>

            {/* Fallback */}
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
};

export default App;