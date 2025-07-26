import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOtp, registerUser } from '../../api/auth';
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';

const SignUp = () => {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        firstName: '',
        lastName: '',
        username: '',
        password: ''
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGetOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.phoneNumber) {
            setError('Phone number is required');
            return;
        }

        try {
            setLoading(true);
            await getOtp(formData.phoneNumber);
            setOtpSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            await registerUser(formData, otp);
            navigate('/signin');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Sign Up
                </Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={otpSent ? handleSignUp : handleGetOtp} sx={{ mt: 3 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={otpSent}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={otpSent}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={otpSent}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={otpSent}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={otpSent}
                    />

                    {otpSent && (
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="OTP (6 digits)"
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            inputProps={{ maxLength: 6 }}
                        />
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading
                            ? (otpSent ? 'Signing Up...' : 'Sending OTP...')
                            : (otpSent ? 'Sign Up' : 'Get OTP')
                        }
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default SignUp;