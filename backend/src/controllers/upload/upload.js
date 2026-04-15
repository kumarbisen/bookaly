import { v2 as cloudinary } from 'cloudinary';
import { Provider } from '../../models/user.js';
import 'dotenv/config';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
});

export const uploadProfileImage = async (req, reply) => {
    try {
        const { providerId } = req.params;
        const file = req.body.file;

        if (!file) {
            return reply.status(400).send({ message: "No file provided" });
        }

        if (!providerId) {
            return reply.status(400).send({ message: "Provider ID required" });
        }

        const buffer = await file.toBuffer();
        const b64 = buffer.toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'bookaly_providers',
            public_id: `provider_${providerId}_${Date.now()}`,
            transformation: [
                { width: 500, height: 500, crop: 'fill', gravity: 'auto' },
                { quality: 'auto' }
            ]
        });

        
        const provider = await Provider.findByIdAndUpdate(
            providerId,
            {
                $set: {
                    profileImage: result.secure_url,
                    profileImagePublicId: result.public_id
                }
            },
            { new: true }
        );

        if (!provider) {
            return reply.status(404).send({ message: "Provider not found" });
        }

        return reply.send({
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url,
            provider
        });

    } catch (error) {
        console.error('Upload error:', error);
        return reply.status(500).send({
            message: 'Image upload failed',
            error: error.message
        });
    }
};

export const deleteProfileImage = async (req, reply) => {
    try {
        const { providerId } = req.params;

        const provider = await Provider.findById(providerId);

        if (!provider || !provider.profileImagePublicId) {
            return reply.status(404).send({ message: "Image not found" });
        }

        
        await cloudinary.uploader.destroy(provider.profileImagePublicId);

        
        provider.profileImage = null;
        provider.profileImagePublicId = null;
        await provider.save();

        return reply.send({ message: 'Image deleted successfully' });

    } catch (error) {
        return reply.status(500).send({
            message: 'Failed to delete image',
            error: error.message
        });
    }
};

export const getProviderProfile = async (req, reply) => {
    try {
        const { providerId } = req.params;

        const provider = await Provider.findById(providerId).select(
            'name email phone profileImage contactd_info provider_id'
        );

        if (!provider) {
            return reply.status(404).send({ message: "Provider not found" });
        }

        return reply.send({ provider });

    } catch (error) {
        return reply.status(500).send({
            message: 'Failed to fetch provider',
            error: error.message
        });
    }
};