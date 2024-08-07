import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { getAllUsers } from "./routes/get-all-user";
import { createUser } from "./routes/create-user";
import { getUser } from "./routes/get-user";
import { login } from "./routes/login";
import { verify } from "jsonwebtoken";
import { prisma } from "./lib/prisma";
import cookie from '@fastify/cookie';
import { fastify } from "fastify";
import { authMiddleware, CRequest } from "./authMiddleware/authenticate";
import WebSocket from "ws";
import fastifyCors from '@fastify/cors'

const app = fastify();
app.register(fastifyCors, {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

const wss = new WebSocket.Server({ noServer: true });
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

app.register(cookie, {
    secret: process.env.C_SECRET,
    hook: 'onRequest',
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(createUser)
app.register(getUser)
app.register(getAllUsers)
app.register(login)

app.get('/painel', { preHandler: authMiddleware }, async (request: CRequest, reply) => {
    const userId = request.user.userId;
    console.log(userId)

    const user = await prisma.user.findUnique({
        select:{
            id: true,
            userName: true,
            email: true,
            login: true,
            password: true,
            createdAt: true,
            slug: true,
        },
        where: {
            id: userId
        }
    })

    if (user === null) {
        throw new Error('Usuario não encontrado.')
    }

    return reply.send({ 
        user: {
            id: user.id,
            userName: user.userName,
            email: user.email,
            login: user.login,
            password: user.password,
            createdAt: user.createdAt,
            slug: user.slug,
        } 
    })
})



app.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log(`HTTP Server running!!!`);
})
