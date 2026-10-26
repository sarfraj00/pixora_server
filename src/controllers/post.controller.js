import { Post } from "../models/post.model.js";
import { cloudinaryUploader, destroyUploadedImage } from "../services/cloudinary.js";
import { Comment } from "../models/comment.model.js";
import fs from 'fs'
import { FollowersAndFollowing } from "../models/followersAndFollowing.model.js";
import { User } from "../models/user.model.js";

export const createPost = async (req, res) => {
    try {
        const { userId } = req;
        const { postCaption, userName } = req.body;
        const postFile = req.file;

        const cloudinary = await cloudinaryUploader(postFile.path);
        if (!cloudinary) return res.status(500).json({ message: 'image uploading failed', success: false });

        fs.unlink(req?.file?.path, (err) => { });
        let post;
        if (!postCaption) {
            post = await Post.create({ userId, postUrl: cloudinary.secure_url, postPublicId: cloudinary.public_id });
        }
        else {
            post = await Post.create({ userId, postUrl: cloudinary.secure_url, postPublicId: cloudinary.public_id, postCaption })
        }

        if (post) {
            const followers = await FollowersAndFollowing.find({ followingId: userId }).select("followerId");
            const followersList = followers.map(follower => follower.followerId);
            const passNotification = await User.updateMany({ _id: { $in: followersList } }, { $inc: { "profile.notificationCount": 1 }, $push: { "profile.notification": { 'message': `A new post has been uploaded by ${userName}. `, postUrl: post.postUrl, postId: post._id, notificationFrom: userName, postCreatorId: userId } } });

            return res.status(201).json({ message: 'Your post uploaded.', success: true })
        }

    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false })
    }
}

export const getUserPosts = async (req, res) => {
    const { userId } = req;
    try {
        const userPosts = await Post.find({ userId }).select(" -updatedAt -__v");

        const followers = await FollowersAndFollowing.find({ followingId: userId }).select('followerId').populate({ path: 'followerId', select: "userName fullName profile.avatarUrl" });

        const following = await FollowersAndFollowing.find({ followerId: userId }).select('followingId').populate({ path: 'followingId', select: "userName fullName profile.avatarUrl" });

        if (userPosts) return res.status(200).json({ 'message': "fetched user's posts successfully", success: true, posts: userPosts, followers, following });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false })
    }
}

export const getSpecificPost = async (req, res) => {
    const { postPublicId } = req.query;

    try {
        const post = await Post.findOne({ postPublicId }).populate({ path: "userId", select: "userName fullName profile.avatarUrl" });

        if (post) {
            const commentsOnPost = await Comment.find({ postId: post._id }).populate({ path: "author", select: 'userName fullName profile.avatarUrl' })
            return res.status(200).json({ message: 'got the post', success: true, post, commentsOnPost });
        }
        return res.status(400).json({ message: 'this post is unavailable.', success: false });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).populate({ path: "userId", select: "userName fullName profile.avatarUrl" }).select('-__v');
        if (posts) return res.status(200).json({ message: 'fetched posts successfully', success: true, posts });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false })
    }
}

export const postLike = async (req, res) => {
    const { userId } = req;
    const { postId, userName, postCreatorId } = req.body;
    try {
        const post = await Post.findOne({ _id: postId, likes: userId });
        if (post) {
            const likedPost = await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { returnDocument: 'after' });

            return res.status(201).json({ message: 'post unliked', success: true })

        }

        const likedPost = await Post.findByIdAndUpdate(postId, { $push: { likes: userId } }, { returnDocument: 'after' });

        if (userId !== postCreatorId) await User.findByIdAndUpdate(likedPost?.userId, { $inc: { 'profile.notificationCount': 1 }, $push: { 'profile.notification': { message: `${userName} liked your post.`, postUrl: likedPost?.postUrl, postId: likedPost?._id, notificationFrom: userName, postCreatorId } } })

        return res.status(201).json({ message: 'post liked', success: true });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}

export const getSavedPosts = async (req, res) => {
    const { userId } = req;
    try {
        const savedPosts = await User.findById(userId).select('profile.saved').populate({ path: 'profile.saved', select: "-__v -updatedAt", populate: { path: 'userId', select: "userName fullName profile.avatarUrl" } });
        if (savedPosts) {

            return res.status(200).json({ message: 'got saved posts', success: true, savedPosts: savedPosts.profile.saved })
        }
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}

export const getPostComments = async (req, res) => {
    const { postId } = req.query;
    try {
        const comments = await Comment.find({ postId }).populate({ path: 'author', select: "fullName userName profile.avatarUrl" }).select("-__v -updatedAt");
        return res.status(200).json({ message: 'comments fetched successfully ', success: true, comments })
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}

export const getPostCommentsCounts = async (req, res) => {
    const { postId } = req.query;
    try {
        const totalComments = await Comment.find({ postId }).countDocuments();
        return res.status(200).json({ message: 'fetched comments count successfully', success: true, totalComments });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}

export const postDelete = async (req, res) => {
    const { id } = req.query;

    try {
        const deletedPost = await Post.findByIdAndDelete(id);
        if (deletedPost) {

            await destroyUploadedImage(deletedPost.postPublicId);
            return res.status(200).json({ message: 'post deleted', success: true });
        }
        return res.status(400).json({ message: 'this post does not exist', success: false })
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}