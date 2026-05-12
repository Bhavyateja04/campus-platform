const cloudinary = require('cloudinary').v2;
const config = require('./index');

/**
 * Configure Cloudinary SDK.
 * Only used when USE_CLOUDINARY=true in environment.
 */
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Upload an image to Cloudinary.
 * @param {string} filePath - Local path to the image file
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = 'campus-analysis') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary.
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
