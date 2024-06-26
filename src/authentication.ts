    import { FastifyRequest, FastifyReply } from 'fastify';
    import { verify } from 'jsonwebtoken';

    export const authenticateUser = async (
        req: FastifyRequest,
        res: FastifyReply
    ) => {
        const jwtSecret = process.env.JWT_SECRET
        if (!jwtSecret) {
            throw new Error('JWT secret is not defined')
        }

        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).send({ message: 'Token não fornecido' });
            return;
        }

        try {
            const decoded = verify(token, jwtSecret);
        } catch (err) {
            res.status(401).send({ message: 'Token inválido' });
        }
    };