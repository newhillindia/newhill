import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  // Upload image to Cloudinary
  static async uploadImage(
    file: File | Buffer | string,
    options: {
      folder?: string;
      public_id?: string;
      transformation?: any;
      resource_type?: 'image' | 'video' | 'raw' | 'auto';
    } = {}
  ) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: options.folder || 'newhill-spices',
        resource_type: options.resource_type || 'image',
        transformation: options.transformation,
        public_id: options.public_id,
        quality: 'auto',
        fetch_format: 'auto',
      });

      return {
        success: true,
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  // Upload multiple images
  static async uploadMultipleImages(
    files: (File | Buffer | string)[],
    options: {
      folder?: string;
      transformation?: any;
    } = {}
  ) {
    try {
      const uploadPromises = files.map((file, index) =>
        this.uploadImage(file, {
          ...options,
          public_id: `${options.public_id || 'image'}_${index}`,
        })
      );

      const results = await Promise.all(uploadPromises);
      return {
        success: true,
        images: results,
      };
    } catch (error) {
      console.error('Cloudinary multiple upload error:', error);
      throw new Error(`Failed to upload images: ${error}`);
    }
  }

  // Delete image from Cloudinary
  static async deleteImage(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: true,
        result,
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete image: ${error}`);
    }
  }

  // Generate optimized image URL
  static getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
      crop?: string;
      gravity?: string;
    } = {}
  ) {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
      gravity = 'auto',
    } = options;

    return cloudinary.url(publicId, {
      width,
      height,
      quality,
      format,
      crop,
      gravity,
      fetch_format: 'auto',
    });
  }

  // Generate product image transformations
  static getProductImageUrl(publicId: string, size: 'thumbnail' | 'medium' | 'large' = 'medium') {
    const sizes = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 },
    };

    return this.getOptimizedImageUrl(publicId, {
      ...sizes[size],
      crop: 'fill',
      gravity: 'auto',
    });
  }

  // Generate hero image URL
  static getHeroImageUrl(publicId: string) {
    return this.getOptimizedImageUrl(publicId, {
      width: 1200,
      height: 600,
      crop: 'fill',
      gravity: 'auto',
    });
  }

  // Generate avatar URL
  static getAvatarUrl(publicId: string) {
    return this.getOptimizedImageUrl(publicId, {
      width: 100,
      height: 100,
      crop: 'fill',
      gravity: 'face',
    });
  }
}

export default cloudinary;


