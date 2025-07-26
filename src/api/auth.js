import axios from 'axios';
import {API_BASE_URL} from '../config/constants';

const registerUser = async (userData, otp) => {
    const response = await axios.post(`${API_BASE_URL}/public/v1/register`, userData, {
        headers: {
            'otp': otp
        }
    });
    return response.data;
};
const login = async (phoneNumber, otp) => {
    const response = await axios.post(`${API_BASE_URL}/public/v1/login`, {}, {
        headers: {
            'mobile-no': phoneNumber,
            'otp': otp
        }
    });
    return response;
};
// Get OTP for registration
const getOtp = async (phoneNumber) => {
    const response = await axios.post(`${API_BASE_URL}/public/v1/register/otp`, {}, {
        headers: {
            'phone-no': phoneNumber
        }
    });
    return response.data;
};


export {registerUser, getOtp, login};