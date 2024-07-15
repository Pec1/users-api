import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { prisma } from "../lib/prisma"

export async function getAllUsers(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/all-users', {
        schema: {
            response: { 
                200: z.object({
                    users: z.array(z.object({
                        id: z.string(),
                        userName: z.string(),
                        email: z.string().email(),
                        login: z.string(),
                        password: z.string(),
                        slug: z.string(),
                        createdAt: z.coerce.date(),
                        userUrl: z.string().url(),
                    }))
                })
            }
        }
    }, async (request, reply) => {
        const users = await prisma.user.findMany({
            select:{
                id: true,
                userName: true,
                email: true,
                login: true,
                password: true,
                createdAt: true,
                slug: true,
            }
        })

        const baseURL = `${request.protocol}://${request.hostname}`
        const usersList = users.map(user => ({
            id: user.id,
            userName: user.userName,
            email: user.email,
            login: user.login,
            password: user.password,
            createdAt: user.createdAt,
            slug: user.slug,
            userUrl: new URL(`/users/${user.slug}`, baseURL).toString(),
        }))

        return reply.send({ users: usersList })
    })
}
