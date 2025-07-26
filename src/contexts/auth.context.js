import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {getToken, setToken, clearToken, setUserData} from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(localStorage.getItem('loggedInUser') ? JSON.parse(localStorage.getItem('loggedInUser')) : null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();
        if (token) {
            // In a real app, you might validate the token or fetch user data here
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        setToken(token);
        setUserData(userData);
        setIsAuthenticated(true);
        navigate('/');
    };

    const logout = () => {
        setUser(null);
        clearToken();
        setIsAuthenticated(false);
        navigate('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);