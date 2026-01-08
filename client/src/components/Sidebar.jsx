import React, { useContext } from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    ExperimentOutlined,
    ScheduleOutlined,
    CalendarOutlined,
    UserOutlined,
    HomeOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
    const location = useLocation();
    const { user } = useContext(AuthContext);

    if (!user) return null;

    const studentItems = [
        {
            key: '/student-dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/student-dashboard">Dashboard</Link>
        },
        {
            key: '/lab-booking',
            icon: <ExperimentOutlined />,
            label: <Link to="/lab-booking">Lab Slot</Link>
        },
        {
            key: '/attendance',
            icon: <ScheduleOutlined />,
            label: <Link to="/attendance">Attendance %</Link>
        },
        {
            key: '/timetable',
            icon: <CalendarOutlined />,
            label: <Link to="/timetable">Timetable</Link>
        },
        {
            key: '/profile',
            icon: <UserOutlined />,
            label: <Link to="/profile">Profile & Levels</Link>
        }
    ];

    const facultyItems = [
        {
            key: '/faculty/home',
            icon: <HomeOutlined />,
            label: <Link to="/faculty/home">Faculty Home</Link>
        },
        {
            key: '/faculty/slots',
            icon: <ExperimentOutlined />,
            label: <Link to="/faculty/slots">Lab Slots</Link>
        },
        {
            key: '/faculty/points',
            icon: <TrophyOutlined />,
            label: <Link to="/faculty/points">Manage Points</Link>
        },
        {
            key: '/faculty/timetable',
            icon: <CalendarOutlined />,
            label: <Link to="/faculty/timetable">Timetable</Link>
        }
    ];

    const items = user.role === 'student' ? studentItems : user.role === 'faculty' ? facultyItems : [];

    return (
        <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
            <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)' }} />
            <Menu
                theme="dark"
                defaultSelectedKeys={[location.pathname]}
                mode="inline"
                items={items}
            />
        </Sider>
    );
};

export default Sidebar;
