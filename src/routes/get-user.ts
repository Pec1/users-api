import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { prisma } from "../lib/prisma"

export async function getUser(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/users/:identifier',{
        schema: {
            params: z.object({
                identifier: z.string(),
            }),
            response: { 
                200: z.object({
                    user: z.object({
                        id: z.string(),
                        userName: z.string(),
                        slug: z.string(),
                        userUrl: z.string().url()
                    })
                })
            }
        }
    },async (request, reply) => {
        const { identifier } = request.params

        let user

        if (z.string().uuid().safeParse(identifier).success) {
            user = await prisma.user.findUnique({
                select:{
                    id: true,
                    userName: true,
                    slug: true,
                },
                where: {
                    id: identifier
                }
            })
        } else {
            user = await prisma.user.findUnique({
                select:{
                    id: true,
                    userName: true,
                    slug: true,
                },
                where: {
                    slug: identifier
                }
            })
        }

        if (user === null) {
            throw new Error('Usuario não encontrado.')
        }

        const baseURL = `${request.protocol}://${request.hostname}`
        const userURL = new URL(`/users/${identifier}`, baseURL)

        return reply.send({ 
            user: {
                id: user.id,
                userName: user.userName,
                slug: user.slug,
                userUrl: userURL.toString(),
            } 
        })
    })
}