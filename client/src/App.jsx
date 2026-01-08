import React, { useState, useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import FacultyHome from './pages/FacultyHome';
import FacultySlots from './pages/FacultySlots';
import FacultyPoints from './pages/FacultyPoints';
import FacultyTimetable from './pages/FacultyTimetable';
// import FacultyDashboard from './pages/FacultyDashboard'; // Deprecated
import StudentDashboard from './pages/StudentDashboard';
import LabBooking from './pages/LabBooking';
import AttendancePage from './pages/AttendancePage';
import TimetablePage from './pages/TimetablePage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Layout, Spin } from 'antd';
import { AuthContext } from './context/AuthContext';

const { Content } = Layout;

const App = () => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const { loading } = useContext(AuthContext);
    const isLoginPage = location.pathname === '/';

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" tip="Loading App..." /></div>;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {!isLoginPage && <Navbar />}
            <Layout>
                {!isLoginPage && <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />}
                <Layout style={{ padding: '0' }}>
                    <Content style={{ margin: '0', minHeight: 280, background: '#fff' }}>
                        <Routes>
                            <Route path="/" element={<Login />} />

                            {/* Faculty Routes */}
                            <Route path="/faculty-dashboard" element={<FacultyHome />} /> {/* Redirect old dashboard to Home */}
                            <Route path="/faculty/home" element={<FacultyHome />} />
                            <Route path="/faculty/slots" element={<FacultySlots />} />
                            <Route path="/faculty/points" element={<FacultyPoints />} />
                            <Route path="/faculty/timetable" element={<FacultyTimetable />} />

                            {/* Student Routes */}
                            <Route path="/student-dashboard" element={<StudentDashboard />} />
                            <Route path="/lab-booking" element={<LabBooking />} />
                            <Route path="/attendance" element={<AttendancePage />} />
                            <Route path="/timetable" element={<TimetablePage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default App;
