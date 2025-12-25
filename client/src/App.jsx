import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Navbar from './components/Navbar';
import { Layout } from 'antd';

const App = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Navbar />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
            </Routes>
        </Layout>
    );
};

export default App;
