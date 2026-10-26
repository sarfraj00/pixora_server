import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js'
cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret
})


export const cloudinaryUploader = async (filename) => {

    try {
        const result = await cloudinary.uploader.upload(filename);

        if (result) {
            return result;
        }
    }
    catch (err) {
    }

}

export const destroyUploadedImage = async (publicId) => {

    try {
        if (publicId) {
          const res =  await cloudinary.uploader.destroy(publicId, {
                invalidate: true,
                resource_type: 'image'
            });
        }
    }
    catch (err) {
    }
}