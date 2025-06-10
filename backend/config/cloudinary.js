import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try{
       const uploadResult = await cloudinary.uploader
       .upload(process.env.CLOUDINARY_IMAGE_URL);
       fs.unlinkSync(process.env.CLOUDINARY_IMAGE_URL);
       return uploadResult.secure_url;
    } catch (error) {
       fs.unlinkSync(process.env.CLOUDINARY_IMAGE_URL);
       return res.status(500).json({message: "Error uploading image to Cloudinary", error: error.message});    
    }
    
}

export default uploadOnCloudinary;