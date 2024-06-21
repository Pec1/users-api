import { fastify } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createUser } from "./routes/create-user";
import { getUser } from "./routes/get-user";
import { getAllUsers } from "./routes/get-all-user";

const app = fastify();
/* const port = 3333; */

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createUser)
app.register(getUser)
app.register(getAllUsers)

const jwtSecret = process.env.JWT_SECRET;

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log(`HTTP Server running!!!`);
})