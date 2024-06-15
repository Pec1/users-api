import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

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
                        login: z.string(),
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
        if (request.session.user) {
            return reply.status(400).send({
                message: 'User is already logged in',
            });
        }
        
        const { login, password } = request.body;

        const user = await prisma.user.findUnique({
            where: { login },
        })

        if (!user || user.password !== password) {
            return reply.status(401).send({
                message: 'Invalid username or password',
            })
        }

        request.session.user = {
            id: user.id,
            login: user.userName,
            userName: user.userName,
            slug: user.slug,
        };  

        console.log(request.session.user);
        
        const baseURL = `${request.protocol}://${request.hostname}`;
        const userURL = new URL(`/users/${user.slug}`, baseURL);

        return reply.status(201).send({
            message: 'Login successful',
            user: {
                id: user.id,
                login: user.login,
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
