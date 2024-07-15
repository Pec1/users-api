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
                login: z.string().min(6),
                password: z.string().min(6),
                email: z.string().email()
            }),

            response: {
                201: z.object({
                    userId: z.string().uuid()
                })
            }
        },
    }, async (request, reply) => {
        const {
            userName,
            login,
            password,
            email
        } = request.body

        const slug = generateSlug(userName)
        const userWithSameSlug = await prisma.user.findUnique({
            where: {
                slug,
            }
        })
        if (userWithSameSlug !== null) {
            throw new Error('Já existe um usuario com o mesmo nome!')
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

        return reply.status(201).send({ userId: user.id })
    })
}

