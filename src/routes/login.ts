require('dotenv').config(); 
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';   

export async function login(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/login', {
        schema: {
            body: z.object({
                login: z.string(),
                password: z.string(),
            }),
            response: {
                200: z.object({
                    message: z.string(),
                    token: z.string(),
                }),
                400: z.object({
                    message: z.string(),
                }),
                401: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { login, password } = request.body;
        /* FDS TILTEI */
    });
}
