import mongoose from 'mongoose';
import env from '../config/env.js'

export const connectDB = async () => {
    try {
        await mongoose.connect(env.mongoUri);
        console.log('🤝 database connected successfully');
    }
    catch (err) {
        console.log(`database connection failed `, err)
    }
}

