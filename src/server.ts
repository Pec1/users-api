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
    const token = request.headers.authorization?.replace('Bearer', '');
    
    if (!token) {
        throw new Error('TOKKEKN is not defined')
    }
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
        throw new Error('JWT secret is not defined')
    }
    try {
        const decoded = verify(token, jwtSecret);
        if (typeof decoded === 'string') {
            throw new Error('Decodificação inválida');
        }
        
        const userId = decoded.userId;

        // Busque os dados do usuário no banco de dados usando Prisma
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return reply.status(404).send({ message: 'Usuário não encontrado' });
        }

        console.log(user, token)
        // Retorne os dados do usuário
        return reply.status(200).send({
            message: 'Dados do usuário',
            user: {
                id: user.id,
                userName: user.userName,
                slug: user.slug,
                // Outros campos do usuário
            },
        });
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