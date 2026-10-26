import { Session } from "../models/session.model.js"
import { generateAccessToken, generateRefreshToken,generateRefreshTokenHash } from "./token.js";

export const createSession = async ({userId, userAgent, ipAddress,email}) => {
    try {
        const session = await Session.create({ userId,refreshTokenHash:'temp' ,userAgent, ipAddress });

        if (session) {
            const accessToken = generateAccessToken(userId,session._id,email)
            const refreshToken = generateRefreshToken(userId, session._id,email);
            const hashedRefreshToken = generateRefreshTokenHash(refreshToken);
            session.refreshTokenHash = hashedRefreshToken;
            await session.save();
            return { accessToken, refreshToken };
        }
    }
    catch (err) {
        
        return res.status(501).json({success:false,message:"internal server error"})
    }
}