import 'dotenv/config'
import { connectDB } from './src/config/connect.js'
import fastify from 'fastify';

import { PORT } from "./src/config/config.js"
import { getFirebaseAdminApp } from './src/config/firebase.js';
import fastifySocketIO from 'fastify-socket.io';
import { admin, buildAdminRouter } from './src/config/setup.js';
import { registerRoutes } from "./src/routes/index.js"


const start = async () => {
    await connectDB(process.env.MONGO_URI);
    getFirebaseAdminApp();
    const app = fastify()



    app.register(fastifySocketIO, {
        cors: {
            origin: '*'
        },
        pingInterval: 10000,
        pingTimeout: 5000,
        transports: ['websocket']
    })

    await buildAdminRouter(app)

    await registerRoutes(app)

    app.get('/', async (req, reply) => {
        return { message: "Bookaly Backend is running" }
    })

    app.listen({ port: PORT, host: '0.0.0.0' }, (err, addr) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Bookaly App running on http://bookaly-backend-alb-1911328299.ap-south-1.elb.amazonaws.com/admin/`);
            
            // console.log( `Bookaly App running on http://Localhost:3000/admin` );
           
        }
    })

    app.ready().then(() => {
        app.io.on("connection", (socket) => {
            console.log("A user Connected")

            socket.on("joinRoom", (orderId) => {
                socket.join(orderId);
                console.log(`User Joined room ${orderId}`);

            })

            socket.on("disconnect", () => {
                console.log("User Disconnected");

            })
        })
    })
}

start()