import { Router } from 'express';
import { follow, getFollowingAndFollower, unfollow } from '../controllers/followerAndFollowing.controller.js';
import { verifyCurrentUser } from '../middlewares/auth.middleware.js';

const followOrUnfollowRouter = Router();

followOrUnfollowRouter.route('/follow')
    .post(follow);

followOrUnfollowRouter.route('/unfollow')
    .delete(unfollow);

followOrUnfollowRouter.route('/check-follower-following')
.get(verifyCurrentUser,getFollowingAndFollower);

export { followOrUnfollowRouter };