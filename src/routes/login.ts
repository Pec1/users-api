import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function login(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/login', {
        schema: {
            body: z.object({
                userName: z.string(),
                password: z.string(),
            }),
            response: {
                200: z.object({     
                    message: z.string(),
                    user: z.object({
                        id: z.string(),
                        userName: z.string(),
                        slug: z.string(),
                        userUrl: z.string().url()
                    })
                }),

                400: z.object({
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const { userName, password } = request.body;

        const user = await prisma.user.findUnique({
            where: { userName },
        })

        if (!user || user.password !== password) {
            return reply.status(401).send({
                message: 'Invalid username or password',
            })
        }
        request.session.user = {
            userId: user.id,
            userName: user.userName,
            slug: user.slug,
        };

        const baseURL = `${request.protocol}://${request.hostname}`;
        const userURL = new URL(`/users/${user.slug}`, baseURL);

        return reply.status(201).send({
            message: 'Login successful',
            user: {
                id: user.id,
                userName: user.userName,
                slug: user.slug,
                userUrl: userURL.toString()
            }
        })
    });
}

function verificarSenha(senhaFornecida: string, senhaArmazenada: string): boolean {
    // Esta é uma comparação direta, apenas para fins ilustrativos
    return senhaFornecida === senhaArmazenada;
}
