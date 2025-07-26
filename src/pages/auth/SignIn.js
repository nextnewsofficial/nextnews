import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getOtp, login} from '../../api/auth';
import {useAuth} from '../../contexts/auth.context';
import {Box, Button, TextField, Typography, Container, Alert} from '@mui/material';

const SignIn = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const {login: authLogin} = useAuth();
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!phoneNumber) {
            setError('Phone number is required');
            return;
        }

        try {
            setLoading(true);
            // Call OTP API with phone number in header
            await getOtp(phoneNumber);

            // Enable OTP input and change button to "Login"
            setOtpSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            // Call login API with phone number and OTP in headers
            const response = await login(phoneNumber, otp);

            // Extract token from response headers
            const token = response.headers['token'];
            if (!token) {
                throw new Error('Authentication token not found in response');
            }

            // Save token to localStorage
            localStorage.setItem('token', token);
            authLogin(response.data, token);

            // Redirect to create article page
            navigate('/create-article');
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || 'Login failed. Please check your OTP and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Typography component="h1" variant="h5">
                    Sign In
                </Typography>
                {error && <Alert severity="error" sx={{width: '100%', mt: 2}}>{error}</Alert>}
                <Box component="form" onSubmit={otpSent ? handleLogin : handleSendOtp} sx={{mt: 3}}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
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
                            inputProps={{maxLength: 6}}
                        />
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{mt: 3, mb: 2}}
                    >
                        {loading
                            ? (otpSent ? 'Logging in...' : 'Sending OTP...')
                            : (otpSent ? 'Login' : 'Send OTP')
                        }
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default SignIn;