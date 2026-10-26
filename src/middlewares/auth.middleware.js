import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const verifyCurrentUser = async (req, res, next) => {
    try {
        const token = req.headers["Authorization"] || req.headers["authorization"];

        if (!token) {
            return res.status(401).json({
                code: "ACCESS_TOKEN_EXPIRED",
                message: "Access token expired", succes: false
            })
        }
        const [key, accessToken] = token.split(' ');

        if (key !== "Bearer" || !(accessToken)) {
            return res.status(401).json({
                code: "ACCESS_TOKEN_EXPIRED",
                message: "Access token expired", succes: false
            })
        }

        try {
            const verifiedAccessToken = jwt.verify(accessToken, env.accessTokenSecret);
            const { userId, sessionId, email } = verifiedAccessToken;
            req.userId = userId;
            req.sessionId = sessionId;
            req.email = email;
            next()
        }
        catch (err) {
            return res.status(401).json({
                code: "ACCESS_TOKEN_EXPIRED",
                message: "Access token expired", succes: false
            })
        }

    }
    catch (err) {
        return res.status(500).json({ message: 'internal server error', success: true });
    }
}