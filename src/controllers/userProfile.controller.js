import { FollowersAndFollowing } from '../models/followersAndFollowing.model.js';
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';

export const getUser = async (req, res) => {
    const { username: userName } = req.params;
    const currentUserId = req.userId;

    try {
        const user = await User.findOne({ userName }).select("-__v -createdAt -updatedAt -isEmailVerified -googleAuth -password");
        if (user) {
            const checkFollowing = await FollowersAndFollowing.findOne({ followerId: currentUserId, followingId: user._id })
           const checkUserFollowingYou = await FollowersAndFollowing.findOne({followerId:user._id,followingId:currentUserId})
            return res.status(200).json({ message: 'user fetched successfully', success: true, user, checkFollowing ,checkUserFollowingYou});
        }
        return res.status(400).json({ 'message': "user not found", success: false });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false })
    }
}


export const getUserPosts = async (req, res) => {
    const { id } = req.params;
    try {
        const posts = await Post.find({ userId: id });


        const followers = await FollowersAndFollowing.find({ followingId: id }).select('followerId').populate({path:'followerId',select:"userName fullName profile.avatarUrl"});


        const following = await FollowersAndFollowing.find({ followerId: id }).select('followingId').populate({path:'followingId',select:"userName fullName profile.avatarUrl"});

        if (posts) {
            return res.status(200).json({ message: "fetched user's posts successfully", success: true, posts,followers,following })
        }

    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}


export const getExistingUsers = async (req, res) => {
    const { username: usernameOrName } = req.query;
    try {
        const users = await User.find({ $or: [{ userName: { $regex: usernameOrName, $options: "i" } }, { fullName: { $regex: usernameOrName, $options: 'i' } }] });

        res.status(200).json({ message: 'fetched users successfully', user: users, success: true })
    }
    catch (err) {
        res.status(500).json({ message: 'internal server error', success: false })
    }
}