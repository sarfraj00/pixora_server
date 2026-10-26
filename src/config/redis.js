import { createClient } from 'redis';
import env from './env.js';

const redis = createClient({ url: env.redisUri });
redis.on('error',(err)=>{
    console.log('redis error ',err)
});

const connectRedis = async () => {
        if (!redis.isOpen) {
            await redis.connect();
            console.log(`🤝 redis connected successfully`)
        }
}

export { redis ,connectRedis};