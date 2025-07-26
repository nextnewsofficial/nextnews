import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../contexts/auth.context';
import {AppBar, Box, Button, IconButton, Menu, MenuItem, Toolbar, Typography} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const TopNavbar = () => {
    const {user, isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/');
    };

    return (
        <AppBar position="static" sx={{backgroundColor: 'black'}}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    News Portal
                </Typography>

                {/* Desktop Navigation (visible on larger screens) */}
                <Box sx={{display: {xs: 'none', md: 'flex'}, gap: 2}}>
                    <Button color="inherit" component={Link} to="/">
                        Home
                    </Button>

                    {isAuthenticated && user ? (
                        <>
                            {(user.roles?.includes('JOURNALIST') || user.roles?.includes('ADMIN')) && (
                                <>
                                    <Button color="inherit" component={Link} to="/create-article">
                                        Create Article
                                    </Button>
                                    <Button color="inherit" component={Link}
                                            to="/edit-article/1"> {/* Replace with dynamic ID if needed */}
                                        Edit Article
                                    </Button>
                                </>
                            )}

                            {(user.roles?.includes('REVIEWER') || user.roles?.includes('JOURNALIST') || user.roles?.includes('ADMIN')) && (
                                <Button color="inherit" component={Link}
                                        to="/review-article/1"> {/* Replace with dynamic ID if needed */}
                                    Review Article
                                </Button>
                            )}

                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={Link} to="/signin">
                                Sign In
                            </Button>
                            <Button color="inherit" component={Link} to="/signup">
                                Sign Up
                            </Button>
                        </>
                    )}
                </Box>

                {/* Mobile Navigation (hamburger menu) */}
                <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMenu}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={open}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleClose} component={Link} to="/">
                            Home
                        </MenuItem>

                        {isAuthenticated && user ? (
                            <>
                                {user.roles?.includes('JOURNALIST') && (
                                    <>
                                        <MenuItem onClick={handleClose} component={Link} to="/create-article">
                                            Create Article
                                        </MenuItem>
                                        <MenuItem onClick={handleClose} component={Link} to="/edit-article/1">
                                            Edit Article
                                        </MenuItem>
                                    </>
                                )}

                                {user.roles?.includes('REVIEWER') && (
                                    <MenuItem onClick={handleClose} component={Link} to="/review-article/1">
                                        Review Article
                                    </MenuItem>
                                )}

                                <MenuItem onClick={handleLogout}>
                                    Logout
                                </MenuItem>
                            </>
                        ) : (
                            <>
                                <MenuItem onClick={handleClose} component={Link} to="/signin">
                                    Sign In
                                </MenuItem>
                                <MenuItem onClick={handleClose} component={Link} to="/signup">
                                    Sign Up
                                </MenuItem>
                            </>
                        )}
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default TopNavbar;