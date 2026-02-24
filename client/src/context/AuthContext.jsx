import React, { createContext, useState, useEffect } from 'react';
import axios from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoggedIn = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const parsedUser = JSON.parse(userInfo);
                    setUser(parsedUser);
                } catch (error) {
                    console.error("Invalid user info", error);
                    localStorage.removeItem('userInfo');
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const saveSession = (userData, token) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);

        if (userData.role === 'faculty' || userData.role === 'admin') {
            navigate('/faculty/home');
        } else {
            navigate('/student-dashboard');
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            const { data } = await axios.post('/auth/login', { email, password });
            saveSession(data, data.token);
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const loginWithGoogle = async (token) => {
        try {
            const { data } = await axios.post('/auth/google', { token });
            saveSession(data, data.token);
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Google login failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithEmail,
            loginWithGoogle,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
