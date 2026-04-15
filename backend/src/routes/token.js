import { bookToken, validateToken, fetchtoken, fetchUserTokens, searchProvider } from "../controllers/token/token.js";
import { verifyToken } from "../middleware/auth.js";


export const tokenRoutes = async (fastify, options) => {


    fastify.addHook("preHandler", async (request, reply) => {
        const isAuthenticated = await verifyToken(request, reply);
        if (!isAuthenticated) {
            return reply.code(401).send({ message: "Unauthorized" })
        }
    });

    // otherwise i can use onRequest with prehandler verifytoken


    fastify.post('/tokens/book', bookToken);

    fastify.get('/tokens', bookToken);


    fastify.post('/tokens/validate', validateToken);
    fastify.get("/tokens/fetch", fetchtoken);
    fastify.get("/tokens/user", fetchUserTokens);
    fastify.get("/provider/search", searchProvider);

}