import { redis } from '../config/redis.js'
export const rateLimiter = (keyName) => {
    return async (req, res, next) => {
        try {
            const ip = req.ip;
            const key = `${keyName}:${ip}`
            const counter = await redis.incr(key);
            if (counter === 1) {
                await redis.expire(key, 60*10);
            }
            if (counter > 8) {
                return res.status(429).json({ message: 'Too many requests, please try again later.', success: false });
            }

            next();
        }
        catch (err) {
            console.error('Error in rateLimiter middleware:', err);
            return res.status(500).json({ message: 'Internal server error', success: false });
        }
    }
}