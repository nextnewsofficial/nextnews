export const getToken = () => {
    return localStorage.getItem('token');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const setUserData = (user) => {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
};

export const clearToken = () => {
    localStorage.removeItem('token');
};

export const isAuthenticated = () => {
    return !!getToken();
};