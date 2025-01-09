// This fastify server is just to handle the discord webhook for suggestions.
// No user data is stored or processed through this server.
// If you are a contributor, do NOT send any user data to this server.

import Fastify from 'fastify';
import cors from '@fastify/cors';
import suggestionsRoute from './api/suggestions';

const fastify = Fastify({
  logger: true
});

await fastify.register(cors, {
  origin: process.env.DOMAIN || true
});

await fastify.register(suggestionsRoute, { prefix: '/api' });

const start = async () => {
  try {
    const port = Number(process.env.SERVER_PORT) || 3001;
    await fastify.listen({ 
      port,
      host: '0.0.0.0'
    });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();