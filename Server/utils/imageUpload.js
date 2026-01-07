import { v2 as cloudinary } from 'cloudinary';

const uploadToCloudinary = async (file, folder, quality) => {
    const options = { 
      resource_type: "raw",
      folder,
      use_filename: true,
      unique_filename: false
    };
    
    if (quality) {
        options.quality = quality;
    }
    
    return await cloudinary.uploader.upload(file.tempFilePath, options);
};

export default uploadToCloudinary;
