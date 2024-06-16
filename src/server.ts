"use strict"

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
const activeSessions = new Set();

app.register(cookie)
app.register(session, {
    secret: "session-2a60b70a-d1a7-4b24-8e4b-667e6582fb2c-users-api",
    cookie: {
        secure: false, // Em produção, defina como true se estiver usando HTTPS
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }
})

app.addHook('onRequest', async (request, reply) => {
    console.log('onRequest hook called', request.session.user);
    if (request.session.id) {
        console.log('Session ID:', request.session.id);
        activeSessions.add(request.session.id);
    }
});

app.addHook('onResponse', async (request, reply) => {
    console.log('onResponse hook called');
    if (reply.statusCode === 401 || reply.statusCode === 403) {
        console.log('Removing Session ID:', request.session.id);
        activeSessions.delete(request.session.id);
    }
});

function listarCookiesDaSessao(request: any) {
    // Verifica se o objeto cookie existe na sessão
    if (request.session && request.session.cookie) {
      // Retorna um objeto com todos os cookies
      return request.session.cookie;
    } else {
      // Se não houver cookies, retorna um objeto vazio
      return {};
    }
  }

app.get('/active-sessions', async (request, reply) => {
    console.log('Active Sessions:', Array.from(activeSessions));
    const cookies = listarCookiesDaSessao(request);
    reply.send({ cookies });
    
    reply.send(Array.from(activeSessions));
});
  
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createUser)
app.register(getUser)
app.register(getAllUsers)
app.register(login)

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log(`HTTP Server running!!!`);
})