import React, { useContext } from 'react';
import { Layout, Menu, Typography } from 'antd';
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
const { Title } = Typography;

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
            label: <Link to="/attendance">Attendance</Link>
        },
        {
            key: '/timetable',
            icon: <CalendarOutlined />,
            label: <Link to="/timetable">Timetable</Link>
        },
        {
            key: '/profile',
            icon: <UserOutlined />,
            label: <Link to="/profile">Profile</Link>
        }
    ];

    const facultyItems = [
        {
            key: '/faculty/home',
            icon: <HomeOutlined />,
            label: <Link to="/faculty/home">Home</Link>
        },
        {
            key: '/faculty/slots',
            icon: <ExperimentOutlined />,
            label: <Link to="/faculty/slots">Lab Slots</Link>
        },
        {
            key: '/faculty/points',
            icon: <TrophyOutlined />,
            label: <Link to="/faculty/points">Points</Link>
        },
        {
            key: '/faculty/timetable',
            icon: <CalendarOutlined />,
            label: <Link to="/faculty/timetable">Timetable</Link>
        }
    ];

    const items = user.role === 'student' ? studentItems : (user.role === 'faculty' || user.role === 'admin') ? facultyItems : [];

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            style={{
                background: '#fff',
                borderRight: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 10
            }}
            width={260}
            theme="light"
        >
            <div style={{
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <Title level={4} style={{ margin: 0, color: 'var(--primary-color)' }}>
                    {collapsed ? 'LS' : 'LabSlot'}
                </Title>
            </div>

            <Menu
                mode="inline"
                defaultSelectedKeys={[location.pathname]}
                selectedKeys={[location.pathname]}
                items={items}
                style={{ borderRight: 0, padding: '16px 0' }}
                className="custom-sidebar-menu"
            />
        </Sider>
    );
};

export default Sidebar;
