import jwt from "jsonwebtoken"


export const verifyToken = async(req,reply)=>{
    try {
        const authHeader = req.headers['authorization'];
        // Bearer is a type of authorization scheme used in the HTTP Authorization header.
        if(!authHeader || !authHeader.startsWith("Bearer")){
            return reply.status(401).send({message:'Access token required'})
        }

        const token = authHeader.split(" ")[1];
        // Authorization: Bearer <your_token_here>
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded;
        return true
    } catch (error) {
         return reply.status(403).send({message:"Invalid or expired token"})
    }
}