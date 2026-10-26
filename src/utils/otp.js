import crypto from 'crypto';

export const generateOtp = ()=>{
    const otp = crypto.randomInt(100000,1000000).toString();
    return otp;
}

export const generateHashedOtp = (otp)=>{
  const hashed = crypto.createHash('sha256').update(otp).digest('hex');
  return hashed;
}