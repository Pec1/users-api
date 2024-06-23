require('dotenv').config(); 
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { sign, verify, JwtPayload } from 'jsonwebtoken';
/* import * as bcrypt from 'bcrypt';    */

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
                    user: z.object({
                        id: z.string(),
                        userName: z.string(),
                        login: z.string(),
                        password: z.string(),
                        slug: z.string(),
                        createdAt: z.date()
                    }),
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
        const { login, password } = request.body

        const jwtSecret = process.env.JWT_SECRET
        if (!jwtSecret) {
            throw new Error('JWT secret is not defined')
        }

        const user = await prisma.user.findUnique({
            where: { login },
        })
        if (!user) {
            return reply.status(401).send({ message: 'User not found! Invalid username or password' })
        }

        const isValidPassword = password === user.password
        if (!isValidPassword) {
            return reply.status(401).send({ message: 'Invalid password' });
        }

        const token = sign({ userId: user.id }, jwtSecret, {
            expiresIn: '1h',
        });
        
        console.log(user, token)

        // reply.redirect('/painel');

        return reply.status(200).send({
            message: 'Login successful',
            user,
            token,
        });
    });
}