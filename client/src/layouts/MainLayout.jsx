import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const { Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Navbar />
            <Layout>
                <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
                <Layout style={{ padding: '0', transition: 'all 0.2s' }}>
                    <Content
                        className="layout-content"
                        style={{
                            margin: '24px 16px',
                            minHeight: 280,
                            borderRadius: 'var(--border-radius-lg)',
                            background: 'transparent'
                        }}
                    >
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
