import {Router} from 'express';
import {verifyCurrentUser} from '../middlewares/auth.middleware.js';
import { getUser, getUserPosts ,getExistingUsers} from '../controllers/userProfile.controller.js';
const userProfileRouter = Router();

userProfileRouter.route('/:username')
.get(verifyCurrentUser,getUser);

userProfileRouter.route('/get-user-posts/:id')
.get(verifyCurrentUser,getUserPosts)

userProfileRouter.route('/get-users/users')
.get(getExistingUsers);

export {userProfileRouter};