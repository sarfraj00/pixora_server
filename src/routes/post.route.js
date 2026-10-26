import { Router } from "express";
import { createPost, getAllPosts, getPostComments, getPostCommentsCounts, getSavedPosts, getSpecificPost, getUserPosts, postDelete, postLike } from "../controllers/post.controller.js";
import { verifyCurrentUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const postRouter = Router();

postRouter.route('/create-post')
    .post(verifyCurrentUser, upload.single('post'), createPost);

postRouter.route('/get-user-posts')
    .get(verifyCurrentUser, getUserPosts)

postRouter.route('/get-specific-post')
    .get(getSpecificPost);

postRouter.route('/get-all-posts')
    .get(verifyCurrentUser, getAllPosts);

postRouter.route('/like')
    .patch(verifyCurrentUser, postLike)

postRouter.route('/get-saved-posts')
    .get(verifyCurrentUser, getSavedPosts);

postRouter.route('/get-post-comments')
    .get(getPostComments);

postRouter.route('/get-post-comments-counts')
    .get(getPostCommentsCounts);

postRouter.route('/delete')
    .delete(postDelete)

export { postRouter }