import { FollowersAndFollowing } from '../models/followersAndFollowing.model.js';
import { User } from '../models/user.model.js';

export const follow = async (req, res) => {
    const { followerId,followerUserName, followingId } = req.body;
    try {
        const startFollowing = await FollowersAndFollowing.create({ followerId, followingId });
        if (startFollowing) {
            const passNotification = await User.findByIdAndUpdate(followingId,{$inc:{"profile.notificationCount":1},$push:{"profile.notification":{message:`${followerUserName} started following you.`,notificationFrom:followerUserName}}})
            return res.status(201).json({ message: 'started following', success: true });
        }
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}

export const unfollow = async (req, res) => {
    const { followerId, followingId } = req.query;
    try {
        const startedUnfollowing = await FollowersAndFollowing.deleteOne({ followerId, followingId });
        if (startedUnfollowing) {
            return res.status(200).json({ message: 'started unfollowing', success: true });
        }
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}

export const getFollowingAndFollower = async (req, res) => {
    const yourId = req.userId;
    const { userId } = req.query;

    try {
        const itsYourAccount = yourId === userId;
        const checkUserFollowsYou = await FollowersAndFollowing.findOne({ followerId: userId, followingId: yourId });
        const checkYouFollowTheUser = await FollowersAndFollowing.findOne({ followerId: yourId, followingId: userId });
        return res.status(200).json({
            message: 'checked successfull', checkYouFollowTheUser, checkUserFollowsYou, success: true,
            itsYourAccount
        })
    }
    catch (err) {
        return res.status(500).json({ "message": "internal server error", success: false })
    }
}