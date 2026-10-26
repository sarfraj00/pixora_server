import mongoose from 'mongoose';

const addLinkSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },

}, { _id: false })


const notificationSchema = new mongoose.Schema({
    message: { type: String, default: '' },
    postUrl: { type: String, default: '' },
    postId: { type: String, default: '' },
    notificationFrom: { type: String, default: '' },
    postCreatorId: { type: String, default: '' }
}, { _id: false, __v: false, timestamps: true })

const profileSchema = new mongoose.Schema({
    avatarUrl: { type: String, default: "" },
    avatarPublicId: {
        type: String,
        default: ''
    },
    coverUrl: { type: String, default: '' },
    coverPublicId: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    links: [
        addLinkSchema
    ],

    saved: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        }
    ],
    notification: [
        notificationSchema
    ],
    notificationCount: {
        type: Number,
        default: 0
    }
}, { _id: false })

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true
    }
    ,
    dateOfBirth: {
        type: Date,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: function () { return this.googleAuth === "local" }
    },
    googleAuth: {
        type: String,
        enum: ['google', 'local'],
        default: 'local'
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    profile: { type: profileSchema, default: () => ({}) },
    expireAt: {
        type: Date,
        expires: 0,

    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema);
export { User }