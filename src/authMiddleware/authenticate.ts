import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { JwtPayload, verify } from 'jsonwebtoken';

export interface CRequest extends FastifyRequest {
    user?: any;
}

export async function authMiddleware(request: CRequest, reply: FastifyReply) {

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
        throw new Error('JWT secret is not defined')
    }

    const token = request.cookies['accessToken'];
    console.log("Token Recebido:", token);

    if (!token) {
        return reply.status(401).send({ message: 'Unauthorized' });
    }

    if (token.split('.').length !== 3) {
        console.log("Token formatado incorretamente:", token);
        return reply.status(401).send({ message: 'Invalid token format' });
    }

    try {
        const decodedToken = verify(token, jwtSecret);
        console.log("Token Decodificado:", decodedToken);
        request.user = decodedToken;
        return;
    } catch (error) {
        console.log("Erro na verificação do token:", error);
        return reply.status(401).send({ message: 'Invalid token' });
    }
}
