import {
    uploadProfileImage,
    deleteProfileImage,
    getProviderProfile
} from '../controllers/upload/upload.js';
import { verifyToken } from '../middleware/auth.js';


export const uploadRoutes = async (fastify) => {
    fastify.post(
        '/upload/profile/:providerId',
        uploadProfileImage
    );

    fastify.delete(
        '/upload/profile/:providerId',
        { onRequest: verifyToken },
        deleteProfileImage
    );

    fastify.get(
        '/upload/provider/:providerId',
        getProviderProfile
    );
};