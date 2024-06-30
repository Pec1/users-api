import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtPayload, verify } from 'jsonwebtoken';

interface CustomRequest extends FastifyRequest {
    decoded: { userId: string | JwtPayload }; // Defina a estrutura do decoded conforme sua necessidade
}


export const authenticateUser = async (
    req: CustomRequest,
    res: FastifyReply
) => {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
        throw new Error('JWT secret is not defined')
    }

    const token = req.cookies.sessionId
    if (!token) {
        res.status(401).send({ message: 'Token não fornecido' });
        return;
    }

    try {
        const decoded = verify(token, jwtSecret);
        req.decoded as JwtPayload = decoded   
    } catch (err) {
        res.status(401).send({ message: 'Token inválido' });
    }
};