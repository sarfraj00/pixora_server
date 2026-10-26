import { Comment } from '../models/comment.model.js';
import { User } from '../models/user.model.js';

export const createPostComment = async (req, res) => {
    const { comment, authorId, postId, authorUserName, postCreatorId, postUrl } = req.body;

    try {
        const createdComment = await Comment.create({ text: comment, author: authorId, postId });
        
        if(authorId !== postCreatorId) await User.findByIdAndUpdate(postCreatorId, { $inc: { 'profile.notificationCount': 1 }, $push: { 'profile.notification': { message: `${authorUserName} commented on your post : "${comment}"`, postUrl, postId ,notificationFrom:authorUserName,postCreatorId} } });

        return res.status(201).json({ message: 'comment is created successfully', success: true })
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}

export const deletePostComment = async (req, res) => {
    const { id } = req.query;
    try {
        const deletedComment = await Comment.findByIdAndDelete(id, { returnDocument: 'after' });
        if (deletedComment) return res.status(200).json({ message: 'comment deleted from this post', success: true });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}

export const editPostComment = async (req, res) => {
    const { id, editedComment } = req.body;
    try {
        const newEditedComment = await Comment.findByIdAndUpdate(id, { text: editedComment });
        if (newEditedComment) {
            return res.status(201).json({ message: 'comment updated', success: true });
        }
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}