"use strict"

import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createUser } from "./routes/create-user";
import { getUser } from "./routes/get-user";
import { getAllUsers } from "./routes/get-all-user";
import session from '@fastify/session';
import cookie from '@fastify/cookie';
import { login } from "./routes/login";
require('dotenv').config();

const app = fastify();
/* const port = 3333; */
const activeSessions = new Set();

app.register(cookie, {
    secret: "2a60b70a-d1a7-4b24-8e4b-667e6582fb2c-users-api", 
    parseOptions: {}, 
});
  
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createUser)
app.register(getUser)
app.register(getAllUsers)
app.register(login)

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT secret is not defined in environment variables');
}

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log(`HTTP Server running!!!`);
})