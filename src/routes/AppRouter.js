import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth.context';
import Home from '../pages/Home';
import SignUp from '../pages/auth/SignUp';
import VerifyOtp from '../pages/auth/VerifyOtp';
import CreateArticle from '../pages/journalist/CreateArticle';
import EditArticle from '../pages/journalist/EditArticle';
import ReviewArticle from '../pages/reviewer/ReviewArticle';
import NotFound from '../pages/NotFound';
import VerifySignInOtp from "../pages/auth/VerifySignInOtp";
import SignIn from "../pages/auth/SignIn";
import TagArticlesPage from "../pages/TagArticlesPage";
import DetailNews from "../pages/DetailNews";

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (roles.length > 0 && (!user.roles || !user.roles.some(role => roles.includes(role)))) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/verify-signin-otp" element={<VerifySignInOtp />} />
            <Route path="/tag/:tag" element={<TagArticlesPage />} />
            <Route path="/article/:id" element={<DetailNews />} />

            {/* Journalist Routes */}
            <Route path="/create-article" element={
                <PrivateRoute roles={['JOURNALIST', 'ADMIN']}>
                    <CreateArticle />
                </PrivateRoute>
            } />
            <Route path="/edit-article/:id" element={
                <PrivateRoute roles={['JOURNALIST', 'ADMIN']}>
                    <EditArticle />
                </PrivateRoute>
            } />

            {/* Reviewer Routes */}
            <Route path="/review-article/:id" element={
                <PrivateRoute roles={['REVIEWER','ADMIN']}>
                    <ReviewArticle />
                </PrivateRoute>
            } />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRouter;