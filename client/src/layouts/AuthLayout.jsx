import React from 'react';

const AuthLayout = ({ children }) => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--primary-bg) 0%, #ffffff 100%)',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
