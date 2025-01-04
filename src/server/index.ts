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
    await fastify.listen({ port: 3001 });
    console.log('Server listening on port 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();