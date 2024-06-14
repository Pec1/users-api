import 'fastify';
import 'fastify-session';

declare module 'fastify' {
    interface Session {
        id: string;
        user?: {
            id: string;
            login: string;
            userName: string;
            slug: string;
        };
    }
}
/* 
declare module 'fastify-session' {
    interface SessionData {
        id: string;
        user?: {
            id: string;
            login: string;
            userName: string;
            slug: string;
        };
    }
}
 */