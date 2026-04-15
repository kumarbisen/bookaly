import { updateSubscription } from "../controllers/subscription/subscription.js";
import { verifyToken } from "../middleware/auth.js";

export const subscriptionRoutes = async (fastify, options) => {
    fastify.post("/subscription/update", { preHandler: [verifyToken] }, updateSubscription);
};
