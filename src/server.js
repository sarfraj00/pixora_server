import app from './app.js';
import env from './config/env.js';
import { connectDB } from './db/connection.js';
import { connectRedis } from './config/redis.js'

(async () => {
  
    try {
        await connectDB();
        await connectRedis()
        app.listen(env.port, () => {
            console.log('server is running on port ', env.port);
        })
    }
    catch (err) {
        console.log('something went wrong ', err);
    }
})()