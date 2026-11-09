import { User } from "../models/user.model.js";
import env from '../config/env.js'
import { sendMail } from "../services/nodemailer.js";
import { passwordHash, passwordCompare } from '../utils/hash.js'
import { createSession } from "../utils/session.js";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookie.js'
import jwt from 'jsonwebtoken'
import { Session } from "../models/session.model.js";
import { generateAccessToken, generateRefreshToken, generateRefreshTokenHash } from "../utils/token.js";
import '../services/firebase.js'
import { getAuth } from 'firebase-admin/auth'
import crypto from 'crypto'
import { Post } from '../models/post.model.js'
import { destroyUploadedImage } from "../services/cloudinary.js";
import { Comment } from '../models/comment.model.js'
import { FollowersAndFollowing } from '../models/followersAndFollowing.model.js'

export const googleAuth = async (req, res) => {
    try {
        const { accessToken } = req.body;
        const user = await getAuth().verifyIdToken(accessToken);
        const { name, email } = user;
        const getUser = await User.findOne({ email })
        if (getUser) {
            if (getUser.googleAuth === "google") {
                const ipAddress = req.ip;
                const userAgent = req.get('User-agent');
                const { _id: userId, email } = getUser;
                const { accessToken, refreshToken } = await createSession({ userId, ipAddress, userAgent, email });
                setRefreshTokenCookie(res, refreshToken);
                return res.status(200).json({ message: 'logged in successfully', success: true, accessToken });
            }
            return res.status(403).json({ success: false, message: 'This email is registered with a password. Please enter your password to log in.' })
        }
        const userName = name.toLowerCase().replaceAll(' ', "") + Date.now();
        const expireAt = new Date(Date.now() + 1000 * 60 * 30);
        const newUser = await User.create({ fullName: name, email, isEmailVerified: true, googleAuth: "google", userName, expireAt })
        if (newUser) {
            const removeExpireAtField = await User.findByIdAndUpdate(newUser._id, { $unset: { expireAt: '' } });
            const ipAddress = req.ip;
            const userAgent = req.get('User-agent');
            const { _id: userId, email } = newUser;
            const { accessToken, refreshToken } = await createSession({ userId, ipAddress, userAgent, email });
            setRefreshTokenCookie(res, refreshToken);
            return res.status(201).json({ "message": "Registration successful", success: true, accessToken })
        }

        return res.status(500).json({ message: 'internal server error', success: false })
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false })
    }
}

export const checkAlreadyExistingUserName = async (req, res) => {
    try {
        const { userName } = req.body;
        if (userName) {
            const existingUser = await User.findOne({ userName });
            if (existingUser) {
                return res.status(409).json({ message: "this username is not available.", success: false });
            }
            return res.status(200).json({ message: "available", success: true });
        }
    }
    catch (err) {
        return res.status(500).json({ message: 'internal serval error', success: false })
    }
}

export const signUp = async (req, res) => {
    try {
        const { userName, fullName, email, password, dateOfBirth } = req.body;
        const existingUsername = await User.findOne({ userName });
        if (existingUsername) {
            return res.status(409).json({ success: false, message: 'this username is already taken' });
        }
        const user = await User.findOne({ email });

        if (user?.googleAuth === "google") return res.status(409).json({ success: false, message: "This email is already registered using Google Sign-In. Please click 'Continue with Google' to log in." });

        if (user) {
            return res.status(409).json({ success: false, message: 'this email is already registered' });
        }
        const hashedPassword = await passwordHash(password);
        const DOB = new Date(dateOfBirth);
        const expireAt = new Date(Date.now() + 1000 * 60 * 30);
        const newUser = await User.create({ fullName, userName, email, password: hashedPassword, dateOfBirth: DOB, expireAt });
        if (newUser) {

            const verificationToken = jwt.sign({ id: newUser._id, email: newUser.email }, env.emailVerificationSecret, { expiresIn: '30m' })
            const verificationUrl = `${env.clientUri}/email-verification?token=${verificationToken}`;

            await sendMail({
                to: newUser.email,
                subject: 'Please Verify Your Email Address',
                text: `Hello,
Welcome to Pixora!

Thank you for signing up. Please verify your email address by clicking the following link:
${verificationUrl}

This link expires in 30 minutes.

If you didn't create this account, please ignore this email.`,

                html: `
    <div style="
        margin: 0;
        padding: 40px 15px;
        background-color: #f4f5fb;
        font-family: Arial, Helvetica, sans-serif;
    ">
        <div style="
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            border: 1px solid #e8eaf0;
            box-shadow: 0 10px 35px rgba(31, 41, 55, 0.07);
        ">

            <!-- Pixora Brand Header -->
             <div style="
            padding: 28px 25px 32px;
            text-align: center;
            background-color: #6d28d9;
            background-image: linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7);
        ">
                <div style="
                    display: inline-block;
                    margin-bottom: 24px;
                ">
                  
                    <span style="
                        margin-left: 9px;
                        color: #ffffff;
                        font-size: 27px;
                        font-weight: 800;
                        letter-spacing: -1px;
                        vertical-align: middle;
                    ">Pixora</span>
                </div>

                <div style="
                    width: 64px;
                    height: 64px;
                    line-height: 64px;
                    margin: 0 auto 16px;
                    border-radius: 50%;
                    background-color: rgba(255,255,255,0.16);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: #ffffff;
                    font-size: 34px;
                    font-weight: bold;
                ">✓</div>

                <h1 style="
                    margin: 0 0 10px;
                    color: #ffffff;
                    font-size: 26px;
                    line-height: 1.3;
                    font-weight: 700;
                ">
                    Verify Your Email
                </h1>

                <p style="
                    margin: 0;
                    color: #ede9fe;
                    font-size: 14px;
                    line-height: 1.7;
                ">
                    Your Pixora journey starts here.
                </p>
            </div>

            <!-- Main Content -->
            <div style="padding: 34px 30px;">

                <h2 style="
                    margin: 0 0 16px;
                    color: #18181b;
                    font-size: 20px;
                    font-weight: 700;
                ">
                    Welcome to Pixora! 👋
                </h2>

                <p style="
                    margin: 0 0 16px;
                    color: #52525b;
                    font-size: 15px;
                    line-height: 1.9;
                ">
                    Thank you for creating your account. We're excited
                    to have you as part of our community, where moments
                    become memories and creativity brings people together.
                </p>

                <p style="
                    margin: 0 0 25px;
                    color: #52525b;
                    font-size: 15px;
                    line-height: 1.9;
                ">
                    Please confirm your email address to activate your
                    account and start sharing your world with Pixora.
                </p>

                <!-- Verification Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a
                        href="${verificationUrl}"
                        target="_blank"
                        style="
                            display: inline-block;
                            padding: 15px 32px;
                            background-color: #6d28d9;
                            background-image: linear-gradient(135deg, #4f46e5, #9333ea);
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 10px;
                            font-size: 15px;
                            font-weight: 700;
                            line-height: 1.5;
                        "
                    >
                        Verify My Email &nbsp;→
                    </a>
                </div>

                <!-- Expiry Notice -->
                <div style="
                    margin: 28px 0;
                    padding: 15px 16px;
                    background-color: #fffbeb;
                    border: 1px solid #fde68a;
                    border-radius: 10px;
                ">
                    <p style="
                        margin: 0;
                        color: #92400e;
                        font-size: 13px;
                        line-height: 1.8;
                    ">
                        <strong>⏳ Link expires in 30 minutes</strong><br>
                        For your security, please verify your email
                        before the link expires.
                    </p>
                </div>

                <!-- Fallback URL -->
                <p style="
                    margin: 24px 0 10px;
                    color: #71717a;
                    font-size: 13px;
                    line-height: 1.8;
                ">
                    Having trouble with the button? Copy and paste
                    this link into your browser:
                </p>

                <div style="
                    padding: 14px;
                    background-color: #f8fafc;
                    border: 1px solid #e4e4e7;
                    border-radius: 9px;
                    overflow-wrap: anywhere;
                ">
                    <a
                        href="${verificationUrl}"
                        target="_blank"
                        style="
                            color: #6d28d9;
                            font-size: 13px;
                            line-height: 1.8;
                            text-decoration: underline;
                            overflow-wrap: anywhere;
                        "
                    >${verificationUrl}</a>
                </div>

                <p style="
                    margin: 25px 0 0;
                    color: #71717a;
                    font-size: 13px;
                    line-height: 1.8;
                ">
                    If you didn't create a Pixora account, you can
                    safely ignore this email. Your account won't be
                    activated through this message unless the link is used.
                </p>
            </div>

            <!-- Pixora Footer -->
            <div style="
                padding: 24px 25px;
                text-align: center;
                background-color: #faf9ff;
                border-top: 1px solid #eeeaf8;
            ">
                <p style="
                    margin: 0 0 8px;
                    color: #6d28d9;
                    font-size: 17px;
                    font-weight: 800;
                    letter-spacing: -0.4px;
                ">
                    Pixora
                </p>

                <p style="
                    margin: 0 0 14px;
                    color: #71717a;
                    font-size: 12px;
                    line-height: 1.8;
                ">
                    Capture moments. Share your world.
                </p>

                <div style="
                    height: 1px;
                    background-color: #e9e5f5;
                    margin: 0 0 14px;
                "></div>

                <p style="
                    margin: 0;
                    color: #a1a1aa;
                    font-size: 11px;
                    line-height: 1.8;
                ">
                    This is an automated email. Please do not reply
                    to this message.
                </p>

                <p style="
                    margin: 6px 0 0;
                    color: #a1a1aa;
                    font-size: 11px;
                ">
                    © ${new Date().getFullYear()} Pixora. All rights reserved.
                </p>
            </div>

        </div>
    </div>
    `,
            })


            return res.status(201).json({ success: true, message: 'Registration successful. Please verify your email address using the link sent to you.' });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'internal server error', success: false })
    }
}

export const signIn = async (req, res) => {

    try {
        const { emailOrUsername, password } = req.body;
        if (!password || !emailOrUsername) {
            return res.status(400).json({ message: "all fields are required", success: false })
        }
        const existingUser = await User.findOne({ $or: [{ email: emailOrUsername }, { userName: emailOrUsername }] });

        if (!existingUser) {
            return res.status(401).json({ message: "Invalid email or password. ", success: false })
        }
        if (existingUser?.googleAuth === "google") return res.status(400).json({ success: false, message: "This email was registered using Google Sign-In. Please click 'Continue with Google' to log in." });

        if (!(existingUser?.isEmailVerified)) {
            return res.status(403).json({ success: false, message: "Please verify your email by clicking the link we sent you" });
        }
        const isPasswordMatched = await passwordCompare(password, existingUser.password)
        if (!isPasswordMatched) {
            return res.status(401).json({ message: "Invalid email or password. ", success: false })
        }
        const { _id: userId, email } = existingUser;
        const ipAddress = req.ip;
        const userAgent = req.get('User-agent');
        const { accessToken, refreshToken } = await createSession({ userId, ipAddress, userAgent, email });
        setRefreshTokenCookie(res, refreshToken);
        return res.status(200).json({ "message": "logged in successfully", success: true, accessToken })
    }
    catch (err) {
        return res.status(500).json({ "message": "internal server error", success: false })
    }
}

export const logout = async (req, res) => {
    try {
        const sessionId = req.sessionId;
        clearRefreshTokenCookie(res);
        await Session.findByIdAndDelete(sessionId);
        return res.status(200).json({ message: 'logged out successfully', success: true });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false })
    }
}



export const logoutAll = async (req, res) => {
    try {
        const userId = req.userId;
        const all = await Session.deleteMany({ userId });
        clearRefreshTokenCookie(res);
        return res.status(200).json({ message: "logged out from all devices", success: true });
    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false })
    }
}

export const deleteAccount = async (req, res) => {
    const userId = req.userId;
    try {
        const posts = await Post.find({ userId });
        const publicIds = posts.map(post => post.postPublicId);
        const sessionId = req.sessionId;
        clearRefreshTokenCookie(res);
        await Session.deleteMany({ userId });
        for (let pI of publicIds) {
            await destroyUploadedImage(pI);
        }
        await Post.deleteMany({ userId });
        await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });
        await Comment.deleteMany({ author: userId });
        await FollowersAndFollowing.deleteMany({ followingId: userId });
        await FollowersAndFollowing.deleteMany({ followerId: userId });
        const user = await User.findByIdAndDelete(userId);

        if (user.profile.coverPublicId) await destroyUploadedImage(user?.profile?.coverPublicId);

        if (user.profile.avatarPublicId) await destroyUploadedImage(user?.profile?.avatarPublicId);

        return res.status(200).json({ message: 'Your account is permanently deleted.', success: true });
    }
    catch (err) {

        return res.status(500).json({ message: 'internal server error', success: false });
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const token = req.query?.token;
        if (!token) {
            return res.status(401).json({ message: 'invalid link', success: false })
        }
        try {
            const verifiedToken = jwt.verify(token, env.emailVerificationSecret);
            const { id: userId, email } = verifiedToken;

            const makeUserEmailVerified = await User.findByIdAndUpdate(userId, { $set: { isEmailVerified: true }, $unset: { expireAt: '' } }, { returnDocument: "after" });
            
            if (!makeUserEmailVerified) return res.status(401).json({ message: 'invalid user', success: false });

            const userAgent = req.get('User-agent');
            const ipAddress = req.ip;

            const { accessToken, refreshToken } = await createSession({ userId, ipAddress, userAgent, email });
            setRefreshTokenCookie(res, refreshToken);
            return res.status(200).json({ "message": "email verification successful", success: true, accessToken })
        }
        catch (err) {
            return res.status(403).json({ "message": "invalid link", success: false })
        }
    }
    catch (err) {
        return res.status(500).json({ 'message': 'internal server error', success: false })
    }
}

export const regenerateAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) return res.status(401).json({ "message": "unauthorized user", success: false });
        let verifiedRefreshToken;
        try {
            verifiedRefreshToken = jwt.verify(refreshToken, env.refreshTokenSecret);
        } catch (err) {

            return res.status(401).json({ message: "invalid refresh token", success: false });
        }

        const getSession = await Session.findById(verifiedRefreshToken.sessionId);
        if (!getSession) return res.status(401).json({ 'message': "invalid refresh token", success: false });
        const hashedRefreshToken = generateRefreshTokenHash(refreshToken)
        if (hashedRefreshToken !== getSession.refreshTokenHash) return res.status(401).json({ message: 'invalid refresh token', success: false });

        const newAccessToken = generateAccessToken(verifiedRefreshToken.userId, getSession._id, verifiedRefreshToken.email);
        const newRefreshToken = generateRefreshToken(verifiedRefreshToken.userId, getSession._id, verifiedRefreshToken.email);
        const newHashedRefreshToken = generateRefreshTokenHash(newRefreshToken);
        getSession.refreshTokenHash = newHashedRefreshToken;
        await getSession.save();
        setRefreshTokenCookie(res, newRefreshToken);
        return res.status(200).json({ message: 'access token regenerated successfully', success: true, accessToken: newAccessToken });

    }
    catch (err) {
        return res.status(500).json({ message: "internal server error", success: false })
    }
}

export const getMe = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId).select('-password -__v -expireAt -googleAuth -createdAt -updatedAt');
        return res.status(200).json({ message: 'user fetched successfully', success: true, user })

    }
    catch (err) {
        return res.status(500).json({ message: "internal server error", success: false })
    }
}