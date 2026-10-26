import bcrypt from 'bcrypt';

export const passwordHash = async (password)=>{
    const hashed = await bcrypt.hash(password,10);
    return hashed;
}

export const passwordCompare = async (password,hashedPassword)=>{
    const result = await bcrypt.compare(password,hashedPassword);
    return result;
}