import { Router } from 'express';
import { changeAvatar, changeCover, deleteLink, editProfile, editProfileSaved, resetNotificationCount } from '../controllers/profileEdit.controller.js';
import { verifyCurrentUser } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';
import { upload } from '../middlewares/multer.middleware.js';

const profileRouter = Router();
// rateLimiter('profile_edit_rate_limiting'),
profileRouter.route('/edit')
    .put(verifyCurrentUser, upload.single("avatar"), editProfile);

profileRouter.route('/delete-link')
    .patch(verifyCurrentUser, deleteLink);

profileRouter.route('/change-cover')
    .patch(verifyCurrentUser, upload.single('coverFile'), changeCover);

profileRouter.route('/change-avatar')
    .patch(verifyCurrentUser, upload.single('avatarFile'), changeAvatar);

profileRouter.route('/saved')
    .patch(editProfileSaved);

profileRouter.route('/reset-notification-count')
    .patch(verifyCurrentUser, resetNotificationCount)

export { profileRouter }