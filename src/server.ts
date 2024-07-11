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

const app = fastify();
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
    console.log(request)
    const userId = request.user.userId;
    console.log(userId)
    return { message: 'You are authenticated', user: request.user }
})
  
app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log(`HTTP Server running!!!`);
})