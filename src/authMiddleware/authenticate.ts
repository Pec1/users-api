import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { verify } from 'jsonwebtoken';

export interface CRequest extends FastifyRequest {
    user?: any;
}

export async function authMiddleware(request: CRequest, reply: FastifyReply) {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
        throw new Error('JWT secret is not defined')
    }
    const token = request.cookies['accessToken'];
    if (!token) {
        return reply.status(401).send({ message: 'Unauthorized' });
    }
    console.log(token)

    try {
        const decodedToken = verify(token, jwtSecret);
        request.user = decodedToken;
        return;
    } catch (error) {
        return reply.status(401).send({ message: 'Invalid token' });
    }
}
