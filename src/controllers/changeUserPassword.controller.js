import { redis } from '../config/redis.js';
import { User } from '../models/user.model.js';
import { sendMail } from '../services/nodemailer.js'
import crypto from 'crypto';
import { passwordHash } from '../utils/hash.js';
import { generateHashedOtp, generateOtp } from '../utils/otp.js';

export const sendOtp = async (req, res) => {
    try {
        const { emailOrUsername } = req.body;
        const getUser = await User.findOne({ $or: [{ email: emailOrUsername }, { userName: emailOrUsername }] });
        if (!getUser) {
            return res.status(401).json({ message: "please make sure your email or username is correct !", success: false });

        }
        if(!getUser?.isEmailVerified){
            return res.status(401).json({message:'please make sure your email is verified.'})
        }
        
        if (getUser?.googleAuth === "google") return res.status(400).json({ success: false, message: "This email was registered using Google Sign-In." });

        const otp = generateOtp();
        const hashedOtp = generateHashedOtp(otp);
        await redis.set(`otp:id:${getUser._id}:ip:${req.ip}`, hashedOtp, { EX: 300 });

        const subject = 'Password Reset Verification Code';
        const text = `Your password reset OTP is ${otp}. It expires in 5 minutes.`;
        const html = `
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
        border: 1px solid #e8eaf0;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 10px 35px rgba(31, 41, 55, 0.07);
    ">

        <!-- Pixora Header -->
        <div style="
            padding: 28px 25px 32px;
            text-align: center;
            background-color: #6d28d9;
            background-image: linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7);
        ">
            <div style="margin-bottom: 24px;">
         
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
                font-size: 30px;
                color: #ffffff;
            ">🔐</div>

            <h1 style="
                margin: 0 0 10px;
                color: #ffffff;
                font-size: 26px;
                line-height: 1.4;
                font-weight: 700;
            ">Password Reset</h1>

            <p style="
                margin: 0;
                color: #ede9fe;
                font-size: 14px;
                line-height: 1.7;
            ">
                Let's get you back into your account.
            </p>
        </div>

        <!-- Email Content -->
        <div style="padding: 35px 30px;">

            <h2 style="
                margin: 0 0 16px;
                color: #18181b;
                font-size: 20px;
                font-weight: 700;
            ">
                Forgot your password?
            </h2>

            <p style="
                margin: 0 0 18px;
                color: #52525b;
                font-size: 15px;
                line-height: 1.9;
            ">
                We received a request to reset your Pixora account
                password. Use the verification code below to continue.
            </p>

            <!-- OTP Label -->
            <p style="
                margin: 28px 0 12px;
                text-align: center;
                color: #71717a;
                font-size: 13px;
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
            ">
                Your Password Reset Code
            </p>

            <!-- OTP Box -->
            <div style="
                padding: 22px 12px;
                margin: 0 auto 25px;
                text-align: center;
                background-color: #f5f3ff;
                border: 1px solid #ddd6fe;
                border-radius: 12px;
            ">
                <div style="
                    color: #6d28d9;
                    font-size: 34px;
                    font-weight: 800;
                    letter-spacing: 8px;
                    line-height: 1.5;
                    overflow-wrap: anywhere;
                ">
                    ${otp}
                </div>
            </div>

            <!-- Expiry Notice -->
            <div style="
                padding: 15px 16px;
                margin: 25px 0;
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
                    <strong>⏳ Expires in 5 minutes</strong><br>
                    Enter this code before it expires to reset your password.
                </p>
            </div>

            <!-- Security Warning -->
            <div style="
                padding: 16px;
                background-color: #fff1f2;
                border: 1px solid #fecdd3;
                border-radius: 10px;
            ">
                <p style="
                    margin: 0 0 6px;
                    color: #9f1239;
                    font-size: 13px;
                    font-weight: 700;
                ">
                    🛡️ Keep your account secure
                </p>

                <p style="
                    margin: 0;
                    color: #881337;
                    font-size: 13px;
                    line-height: 1.8;
                ">
                    Never share this code with anyone. Pixora will never
                    ask you to disclose your password reset OTP.
                </p>
            </div>

            <p style="
                margin: 25px 0 0;
                color: #71717a;
                font-size: 13px;
                line-height: 1.8;
            ">
                If you didn't request a password reset, you can safely
                ignore this email. Your password will remain unchanged.
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
            ">Pixora</p>

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
                margin-bottom: 14px;
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
                &copy; ${new Date().getFullYear()} Pixora. All rights reserved.
            </p>
        </div>

    </div>
</div>
`

        await sendMail({ to: getUser.email, subject, text, html });
        return res.status(200).json({ 'message': "OTP sent successfully to your registered email.", success: true, user: { email: getUser.email, ip: req.ip, id: getUser._id } })
    }
    catch (err) {
        return res.status(500).json({ message: "internal server error", success: false })
    }
}

export const resendOtp = async (req, res) => {
    try {
        const user = req.headers['x-custom-user-data'];
        if (!user) {
            return res.status(500).json({ message: "please make sure custom header of user-data is added !", success: false });
        }

        const userData = JSON.parse(user);

        const { email, id, ip } = userData;
        const otp = generateOtp();
        const hashedOtp = generateHashedOtp(otp);
        await redis.set(`otp:id:${id}:ip:${ip}`, hashedOtp, { EX: 300 });

        const subject = 'Password Reset Verification Code';
        const text = `Your password reset OTP is ${otp}. It expires in 5 minutes.`;
        const html = `
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
        border: 1px solid #e8eaf0;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 10px 35px rgba(31, 41, 55, 0.07);
    ">

        <!-- Pixora Header -->
        <div style="
            padding: 28px 25px 32px;
            text-align: center;
            background-color: #6d28d9;
            background-image: linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7);
        ">
            <div style="margin-bottom: 24px;">
         
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
                font-size: 30px;
                color: #ffffff;
            ">🔐</div>

            <h1 style="
                margin: 0 0 10px;
                color: #ffffff;
                font-size: 26px;
                line-height: 1.4;
                font-weight: 700;
            ">Password Reset</h1>

            <p style="
                margin: 0;
                color: #ede9fe;
                font-size: 14px;
                line-height: 1.7;
            ">
                Let's get you back into your account.
            </p>
        </div>

        <!-- Email Content -->
        <div style="padding: 35px 30px;">

            <h2 style="
                margin: 0 0 16px;
                color: #18181b;
                font-size: 20px;
                font-weight: 700;
            ">
                Forgot your password?
            </h2>

            <p style="
                margin: 0 0 18px;
                color: #52525b;
                font-size: 15px;
                line-height: 1.9;
            ">
                We received a request to reset your Pixora account
                password. Use the verification code below to continue.
            </p>

            <!-- OTP Label -->
            <p style="
                margin: 28px 0 12px;
                text-align: center;
                color: #71717a;
                font-size: 13px;
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
            ">
                Your Password Reset Code
            </p>

            <!-- OTP Box -->
            <div style="
                padding: 22px 12px;
                margin: 0 auto 25px;
                text-align: center;
                background-color: #f5f3ff;
                border: 1px solid #ddd6fe;
                border-radius: 12px;
            ">
                <div style="
                    color: #6d28d9;
                    font-size: 34px;
                    font-weight: 800;
                    letter-spacing: 8px;
                    line-height: 1.5;
                    overflow-wrap: anywhere;
                ">
                    ${otp}
                </div>
            </div>

            <!-- Expiry Notice -->
            <div style="
                padding: 15px 16px;
                margin: 25px 0;
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
                    <strong>⏳ Expires in 5 minutes</strong><br>
                    Enter this code before it expires to reset your password.
                </p>
            </div>

            <!-- Security Warning -->
            <div style="
                padding: 16px;
                background-color: #fff1f2;
                border: 1px solid #fecdd3;
                border-radius: 10px;
            ">
                <p style="
                    margin: 0 0 6px;
                    color: #9f1239;
                    font-size: 13px;
                    font-weight: 700;
                ">
                    🛡️ Keep your account secure
                </p>

                <p style="
                    margin: 0;
                    color: #881337;
                    font-size: 13px;
                    line-height: 1.8;
                ">
                    Never share this code with anyone. Pixora will never
                    ask you to disclose your password reset OTP.
                </p>
            </div>

            <p style="
                margin: 25px 0 0;
                color: #71717a;
                font-size: 13px;
                line-height: 1.8;
            ">
                If you didn't request a password reset, you can safely
                ignore this email. Your password will remain unchanged.
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
            ">Pixora</p>

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
                margin-bottom: 14px;
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
                &copy; ${new Date().getFullYear()} Pixora. All rights reserved.
            </p>
        </div>

    </div>
</div>
`

        await sendMail({ to: email, subject, text, html });
        return res.status(200).json({ 'message': "OTP resent successfully to your registered email.", success: true, user: { email, ip, id } })
    }
    catch (err) {
        return res.status(500).json({ message: "internal server error", success: false })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const userData = req.headers['x-custom-user-data'];

        if (!otp) return res.status(400).json({ message: 'otp field cannot be empty', success: false });

        if (!userData) {
            return res.status(500).json({ message: "make sure custom header of user is added", success: false });
        }
        const user = JSON.parse(userData);
        const hashedOtp = generateHashedOtp(otp)
        const sentOtp = await redis.get(`otp:id:${user.id}:ip:${user.ip}`)

        if (hashedOtp !== sentOtp) {
            return res.status(400).json({
                "success": false,
                "message": "The OTP entered is incorrect or expired. Please try again."
            })
        }
        await redis.del(`otp:id:${user.id}:ip:${user.ip}`)

        return res.status(200).json({ message: "otp verification successful ", success: true, user });

    }
    catch (err) {
      
        return res.status(500).json({ message: "internal server error", success: true })
    }
}


export const setNewPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'both fields are required', success: false });
        }
        if (newPassword !== confirmPassword) return res.status(400).json({ message: 'The password confirmation does not match.', success: false });
        const userHeader = req.headers['x-custom-user-data'];
        if (!userHeader) return res.status(500).json({ message: 'make sure custom header of user is added', success: false })

        const user = JSON.parse(userHeader);
        const hashedPassword = await passwordHash(newPassword);
        await User.findByIdAndUpdate(user.id, { $set: { password: hashedPassword } }, { returnDocument: 'after' });

        return res.status(201).json({ message: "Password updated. Please log in with your new credentials.", success: true })
    }

    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: false })
    }
}