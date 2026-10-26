import { Router } from 'express';
import { resendOtp, sendOtp, setNewPassword, verifyOtp } from '../controllers/changeUserPassword.controller.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const changeUserPasswordRouter = Router();

changeUserPasswordRouter.route('/send-otp')
    .post(rateLimiter('sendotp_rate_limiting'), sendOtp)

changeUserPasswordRouter.route('/resend-otp')
    .get(rateLimiter('resendotp_rate_limiting'), resendOtp);

changeUserPasswordRouter.route('/verify-otp')
    .post(rateLimiter('verifyotp_rate_limiting'), verifyOtp);

changeUserPasswordRouter.route('/set-new-password')
    .patch(rateLimiter('setnewpassword_rate_limiting'), setNewPassword);



export { changeUserPasswordRouter }