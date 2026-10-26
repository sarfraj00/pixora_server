import jwt from 'jsonwebtoken';
import env from '../config/env.js'
import crypto from 'crypto'

export const generateAccessToken = (userId, sessionId,email) => {
    const accessToken = jwt.sign({ userId, sessionId,email }, env.accessTokenSecret,{expiresIn:'15m'});
    return accessToken;
}

export const generateRefreshToken = (userId, sessionId,email) => {
    const refreshToken = jwt.sign({ userId, sessionId ,email}, env.refreshTokenSecret,{expiresIn:'30d'});
    return refreshToken;
}

export const generateRefreshTokenHash = (refreshToken) => {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    return hash;
}