import {v2} from 'cloudinary'
import fs from 'fs'

cloudinary.config({ 
    cloud_name: 'process.env.CLOUDINARY_CLOUD_NAME', 
    api_key: 'process.env.CLOUDINARY_CLOUD_API_KEY', 
    api_secret: 'process.env.CLOUDINARY_CLOUD_API_SECRET'
});

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        });
        console.log(`file uploaded successfully : ${response}`);
        return response;
    }
    catch(e){
        fs.unlinkSync(localFilePath)
        return null 
    }
}

export {uploadOnCloudinary}