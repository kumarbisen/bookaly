import {
    fetchUser,
    loginCustomer,
    registerCustomer,
    resetCustomerPassword,
    loginProvider,
    registerProvider,
    refreshToken,
    checkUsername,
    resetProviderPassword,
} from '../controllers/auth/auth.js'
import { updateUser } from '../controllers/tracking/tracking.js'
import { verifyToken } from '../middleware/auth.js'
// here we have to use lowercase becoz mongodb  automatically generate model name in lowercase if you doesn't specificed in your schema in uppercase 
export const authRoutes = async (fastify, options) => {

    fastify.post("/customer/login", loginCustomer)
    fastify.post("/customer/register", registerCustomer)
    fastify.post("/customer/reset-password", resetCustomerPassword)
    fastify.post("/provider/login", loginProvider)
    fastify.post("/provider/register", registerProvider)
    fastify.get("/provider/check-username", checkUsername)
    fastify.post("/provider/reset-password", resetProviderPassword)
    fastify.post("/refresh-token", refreshToken)
    fastify.get("/user", { preHandler: [verifyToken] }, fetchUser)
    fastify.post("/user", { preHandler: [verifyToken] }, updateUser)

}