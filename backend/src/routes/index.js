import { authRoutes } from './auth.js'
import { tokenRoutes } from './token.js';
import { subscriptionRoutes } from './subscription.js';
import { uploadRoutes } from './upload.js';

const prefix = "/api"

export const registerRoutes = async (fastify) => {
    fastify.register(authRoutes, { prefix: prefix });
    fastify.register(tokenRoutes, { prefix: prefix })
    fastify.register(subscriptionRoutes, { prefix: prefix })
    fastify.register(uploadRoutes, { prefix: prefix })
}