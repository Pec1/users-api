import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { getAllUsers } from "./routes/get-all-user";
import { authenticateUser } from "./authentication";
import { createUser } from "./routes/create-user";
import { getUser } from "./routes/get-user";
import { login } from "./routes/login";
import { verify } from "jsonwebtoken";
import { prisma } from "./lib/prisma";
import cookie from '@fastify/cookie';
import { fastify } from "fastify";

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


app.get('/painel', { preHandler: authenticateUser }, async (request, reply) => {


    try {

    } catch (err) {
        return reply.status(401).send({ message: 'Token inválido' });
    }
});

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log(`HTTP Server running!!!`);
})