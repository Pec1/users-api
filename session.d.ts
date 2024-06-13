import '@fastify/session';

declare module '@fastify/session' {
    interface Session {
        user?: {
            userId: string;
            userName: string;
            slug: string;
        };
    }
}