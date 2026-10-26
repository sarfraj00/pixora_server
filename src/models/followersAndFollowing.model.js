import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    followerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    followingId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
});

export const FollowersAndFollowing = mongoose.model("FollowersAndFollowing",schema);
