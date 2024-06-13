import 'fastify';

declare module 'fastify' {
    interface Session {
        user?: {
            userId: string;
            userName: string;
            slug: string;
        };
    }
}