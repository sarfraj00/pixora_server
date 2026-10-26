import {Router} from 'express';
import { createPostComment, deletePostComment, editPostComment } from '../controllers/comment.controller.js';
const commentRouter = Router();

commentRouter.route('/create-post-comment')
.post(createPostComment);

commentRouter.route('/delete-post-comment')
.delete(deletePostComment);

commentRouter.route('/edit-post-comment')
.patch(editPostComment);

export {commentRouter};