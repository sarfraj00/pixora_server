import 'dotenv/config';

const envData = ['PORT', 'MONGO_URI', 'CLIENT_URI', 'REFRESH_TOKEN_SECRET', 'ACCESS_TOKEN_SECRET', 'SERVER_URI', 'EMAIL_VERIFICATION_SECRET', 'REDIS_URI', 'FIREBASE_SERVICE_TYPE', 'FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_CLIENT_ID', 'FIREBASE_AUTH_URI', 'FIREBASE_TOKEN_URI', 'FIREBASE_AUTH_PROVIDER_X509_CERT_URL', 'FIREBASE_CLIENT_X509_CERT_URL', 'FIREBASE_UNIVERSE_DOMAIN', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
for (let val of envData) {
    if (!(process.env[val])) {
        throw new Error(`${val} is not defined in env file`);
    }
}
for (const val of ['GOOGLE_USER', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']) {
    if (!process.env[val]) {
        throw new Error(`${val} is not defined in env file`);
    }
}
const env = {
    port: process.env.PORT,
    mongoUri: process.env.MONGO_URI,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    clientUri: process.env.CLIENT_URI,
    serverUri: process.env.SERVER_URI,
   
    googleUser: process.env.GOOGLE_USER,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN, 
    emailVerificationSecret: process.env.EMAIL_VERIFICATION_SECRET,
    //REDIS
    redisUri: process.env.REDIS_URI,
    //FIREBASE GOOGLE AUTH
    firebaseServiceType: process.env.FIREBASE_SERVICE_TYPE,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebasePrivateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    firebaseClientId: process.env.FIREBASE_CLIENT_ID,
    firebaseAuthUri: process.env.FIREBASE_AUTH_URI,
    firebaseTokenUri: process.env.FIREBASE_TOKEN_URI,
    firebaseAuthProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    firebaseClientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    firebaseUniverseDomain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    //cloudinary
    cloudinaryCloudName : process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey : process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret : process.env.CLOUDINARY_API_SECRET,

    brevoApiKey : process.env.BREVO_API_KEY
}

export default env;