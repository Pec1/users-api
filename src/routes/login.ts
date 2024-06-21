import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { sign, verify } from 'jsonwebtoken';

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
        // Verificar se há um token JWT no cabeçalho de autorização
        const authHeader = request.headers.authorization;
        const jwtSecret = "tewstes";

        if (authHeader && jwtSecret) {
            const token = authHeader.split(' ')[1]; // Assume formato "Bearer TOKEN"
            try {
                // Tenta verificar o token
                verify(token, jwtSecret);
                // Se o token for válido, envia uma resposta indicando que o usuário já está logado
                return reply.status(400).send({
                    message: 'User is already logged in',
                });
            } catch (error) {
                // Se houver um erro ao verificar o token (por exemplo, token expirado), continue com o processo de login
            }
        }

        const { login, password } = request.body;

        const user = await prisma.user.findUnique({
            where: { login },
        });

        if (!user || !verificarSenhaSegura(password, user.password)) {
            return reply.status(401).send({
                message: 'Invalid username or password',
            });
        }

        // Gerar token JWT com identificador do usuário
        const token = sign({ userId: user.id }, jwtSecret, { expiresIn: '30m' });

        return reply.status(200).send({
            message: 'Login successful',
            token,
        });
    });
}
function verificarSenhaSegura(senhaFornecida: string, senhaArmazenada: string): boolean {
    return senhaFornecida === senhaArmazenada;
}