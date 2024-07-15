import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { generateSlug } from "../utils/generate-slug"
import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify"

export async function createUser(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/users', {
        schema: {
            body: z.object({
                userName: z.string().min(4),
                email: z.string().email(),
                login: z.string().min(6),
                password: z.string().min(6)
            }),

            response: {
                201: z.object({
                    message: z.string(),
                    userId: z.string().uuid()
                }),
                401: z.object({
                    message: z.string(),
                }),
            }
        },
    }, async (request, reply) => {
        const { userName, login, password, email } = request.body

        const normalizedLogin = login.toLowerCase()
        const normalizedEmail = email.toLowerCase()
        const slug = generateSlug(userName)

        const existingUserLogin = await prisma.user.findUnique({
            where: { 
                login: normalizedLogin,
            },
        });
        if (existingUserLogin) {
            return reply.status(401).send({ message: 'Usuário com este login já existe' });
        }

        const existingUserEmail = await prisma.user.findUnique({
            where: { 
                email: normalizedEmail,
            },
        });
        if (existingUserEmail) {
            return reply.status(401).send({ message: 'Usuário com este email já existe' });
        }
        
        const existingUserSlug = await prisma.user.findUnique({
            where: { 
                slug,
            },
        });
        if (existingUserSlug) {
            return reply.status(401).send({ message: 'Usuário com este nome já existe' });
        }
        

        const user = await prisma.user.create({
            data: {
                userName,
                login,
                password, 
                email,
                slug
            }
        })

        return reply.status(201).send({ message: 'User created successful', userId: user.id })
    })
}

