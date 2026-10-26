import { checkAlreadyExistingUserName, deleteAccount, getMe, googleAuth, logout, logoutAll, regenerateAccessToken, signIn, signUp, verifyEmail } from '../controllers/auth.controller.js';
import { Router } from 'express';
import { verifyCurrentUser } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';


const authRouter = Router();


authRouter.route('/get-username-availability')
.post(checkAlreadyExistingUserName);

authRouter.route('/google-auth')
.post(googleAuth)

authRouter.route('/signup')
    .post(signUp);

authRouter.route('/email-verification')
    .get(verifyEmail)

authRouter.route('/signin')
    .post(rateLimiter('signin_rate_limiting'),signIn)

authRouter.route('/logout')
.get(verifyCurrentUser ,logout)

authRouter.route('/logout-all')
.get(verifyCurrentUser,logoutAll);

authRouter.route('/regenerate-access-token')
.get(regenerateAccessToken)


authRouter.route('/get-me')
.get(verifyCurrentUser,getMe)

authRouter.route('/delete-account')
.get(verifyCurrentUser,deleteAccount);

export { authRouter }