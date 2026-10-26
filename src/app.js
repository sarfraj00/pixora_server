import express from 'express';
import path from 'path'
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import env from './config/env.js'
import { authRouter } from './routes/auth.route.js';
import { changeUserPasswordRouter } from './routes/changeUserPassword.route.js';
import { profileRouter } from './routes/profileEdit.route.js';
import { postRouter } from './routes/post.route.js';
import { userProfileRouter } from './routes/userProfile.route.js';
import { commentRouter } from './routes/comment.route.js';
import { followOrUnfollowRouter } from './routes/followerAndFollowing.route.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet())
app.use(cookieParser());
app.use(cors({
    origin: env.clientUri,
    credentials: true
}))

app.get('/', (req, res) => {
    res.send("server is running")

})

app.use('/api/v1/auth', authRouter);

app.use('/api/v1/forgot-password', changeUserPasswordRouter);

app.use('/api/v1/profile', profileRouter);

app.use('/api/v1/post', postRouter);

app.use('/api/v1/user', userProfileRouter);

app.use('/api/v1/comment', commentRouter);

app.use('/api/v1/friend', followOrUnfollowRouter);

export default app;