import mongoose from 'mongoose';
const postSchema = new mongoose.Schema({
    postCaption: {
        type: String,

    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    postUrl: {
        type: String,
        required: true,
    },
    postPublicId: {
        type: String,
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export { Post };