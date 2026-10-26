import { User } from "../models/user.model.js";
import fs from 'fs'
import { cloudinaryUploader, destroyUploadedImage } from "../services/cloudinary.js";

export const editProfile = async (req, res) => {
    try {
        let cloudinaryRes;

        const { fullName, userName, bio, url, title, previousAvatarPublicId } = req.body;
        const { userId } = req;

        if (req?.file) {
            cloudinaryRes = await cloudinaryUploader(req?.file?.path);
            if (previousAvatarPublicId) await destroyUploadedImage(previousAvatarPublicId);
            fs.unlink(req?.file?.path, (err) => { })
        }


        if (!userName && !fullName) return res.status(400).json({ message: 'username and name are required', success: false })

        if (!userName) return res.status(400).json({ message: 'username is required', success: false });

        if (!fullName) return res.status(400).json({ message: 'name is required ', success: false });

        if ((url && !title) || (title && !url)) {
            return res.status(400).json({ message: 'if you are trying to add a link then make sure both url and title fields are filled.', success: false })
        }

        if (!url && !title) {
            if (cloudinaryRes) {
                const user = await User.findByIdAndUpdate(userId, { $set: { fullName, userName, "profile.bio": bio, "profile.avatarUrl": cloudinaryRes.secure_url, "profile.avatarPublicId": cloudinaryRes.public_id }, }, { returnDocument: 'after' });
                return res.status(201).json({ message: 'your profile is updated.', success: true })
            }
            const user = await User.findByIdAndUpdate(userId, { $set: { fullName, userName, "profile.bio": bio, }, }, { returnDocument: 'after' });
            return res.status(201).json({ message: 'your profile is updated.', success: true })
        }
        if (cloudinaryRes) {
            const user = await User.findByIdAndUpdate(userId, { $set: { fullName, userName, "profile.bio": bio, "profile.avatarUrl": cloudinaryRes.secure_url, "profile.avatarPublicId": cloudinaryRes.public_id }, $push: { "profile.links": { url, title } } }, { returnDocument: 'after' });
            if (user) {
                return res.status(201).json({ message: "your profile is updated. ", success: true })
            }
        }
        const user = await User.findByIdAndUpdate(userId, { $set: { fullName, userName, "profile.bio": bio, }, $push: { "profile.links": { url, title } } }, { returnDocument: 'after' });
        if (user) {
            return res.status(201).json({ message: "your profile is updated. ", success: true })
        }
    }
    catch (err) {

        return res.status(500).json({ message: 'internal server error', success: false })
    }
}

export const deleteLink = async (req, res) => {
    const { url, title } = req.body;
    const { userId } = req;
    if (!url || !title) {
        return res.status(400).json({ message: 'both url and title are required', success: false });
    }
    try {
        await User.findOneAndUpdate({ _id: userId, "profile.links": { $elemMatch: { url, title } } }, { $pull: { "profile.links": { url, title } } });
        return res.status(200).json({ message: `${title} link is deleted successfully`, success: true })
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }

}

export const changeCover = async (req, res) => {
    const { coverPublicId } = req.body;
    const { userId } = req;
    let cloudinaryRes;
    try {
        if (req?.file) {
            cloudinaryRes = await cloudinaryUploader(req?.file?.path);
            if (coverPublicId) await destroyUploadedImage(coverPublicId);
            fs.unlink(req?.file?.path, (err) => { })
        }
        if (cloudinaryRes) {
            const user = await User.findByIdAndUpdate(userId, { $set: { "profile.coverUrl": cloudinaryRes.secure_url, "profile.coverPublicId": cloudinaryRes.public_id }, }, { returnDocument: "after" });
            if (user) {
                return res.status(201).json({ message: 'your profile cover is updated. ', success: true, user })
            }
        }
    }
    catch (err) {

        return res.status(500).json({ message: 'internal server error', success: false })
    }
}

export const changeAvatar = async (req, res) => {
    const { avatarPublicId } = req.body

    const { userId } = req;
    let cloudinaryRes;
    try {
        if (req?.file) {
            cloudinaryRes = await cloudinaryUploader(req?.file?.path);
            if (avatarPublicId) await destroyUploadedImage(avatarPublicId);
            fs.unlink(req?.file?.path, (err) => { })
        }
        if (cloudinaryRes) {
            const user = await User.findByIdAndUpdate(userId, { $set: { "profile.avatarUrl": cloudinaryRes.secure_url, "profile.avatarPublicId": cloudinaryRes.public_id } }, { returnDocument: "after" });
            if (user) {

                return res.status(201).json({ message: 'your profile picture is updated. ', success: true, user })
            }
        }
    }
    catch (err) {

        return res.status(500).json({ message: 'internal server error', success: false })
    }
}

export const editProfileSaved = async (req, res) => {
    const { id, postId } = req.body;

    try {
        const user = await User.findOne({ _id: id, "profile.saved": postId });
        if (user) {
            await User.findByIdAndUpdate(id, { $pull: { "profile.saved": postId } });
            return res.status(201).json({ message: 'saved post is removed from your profile', success: true });
        }
        await User.findByIdAndUpdate(id, { $push: { "profile.saved": postId } });
        return res.status(201).json({ message: 'post saved to your profile', success: true });
    }

    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false });
    }
}


export const resetNotificationCount = async (req, res) => {
    const { userId } = req;
    try {
        const user = await User.findByIdAndUpdate(userId, { $set: { 'profile.notificationCount': 0 } }, { returnDocument: 'after' });
        if (user) return res.status(200).json({ message: 'notification count reset.', success: true, user });
        return res.status(400).json({ messgae: 'something went wrong', success: false });

    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false })
    }

}