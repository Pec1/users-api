import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createUser } from "./routes/create-user";
import { getUser } from "./routes/get-user";
import { getAllUsers } from "./routes/get-all-user";
import session from '@fastify/session';
import cookie from '@fastify/cookie';
import { login } from "./routes/login";

const app = fastify();
/* const port = 3333; */
const activeSessions = new Set<string>();

app.register(cookie, {
    secret: "cookie-848549c8-cd87-41bf-83d4-e79f50c1a012-users-api",
    hook: 'onRequest',
})

app.register(session, {
    secret: "session-2a60b70a-d1a7-4b24-8e4b-667e6582fb2c-users-api",
    cookie: {
        secure: false, // Em produção, defina como true se estiver usando HTTPS
        httpOnly: true,
        maxAge: 1800
    }
})
  
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createUser)
app.register(getUser)
app.register(getAllUsers)
app.register(login)

// Hook para adicionar o ID da sessão ao conjunto quando uma sessão é criada
app.addHook('onRequest', (request, reply, done) => {
    if (request.session.id) {
        activeSessions.add(request.session.id);
    }
    done();
});
  
// Hook para remover o ID da sessão do conjunto quando uma sessão é destruída
app.addHook('onResponse', (request, reply, done) => {
    if (reply.statusCode === 401 || reply.statusCode === 403) {
        activeSessions.delete(request.session.id);
    }
    done();
});
  
// Rota para visualizar todas as sessões ativas
app.get('/active-sessions', (request, reply) => {
    reply.send(Array.from(activeSessions));
});   

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log(`HTTP Server running!!!`);
})