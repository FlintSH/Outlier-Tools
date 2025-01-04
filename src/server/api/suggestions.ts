import { FastifyPluginAsync } from 'fastify';

const suggestionsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post('/suggestions', async (request, reply) => {
    const { suggestion } = request.body as { suggestion: string };
    
    if (!suggestion?.trim()) {
      return reply.status(400).send({ error: 'Suggestion is required' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      fastify.log.error('Discord webhook URL not configured');
      return reply.status(500).send({ error: 'Server configuration error' });
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `**New Tool Suggestion:**\n${suggestion}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit to Discord');
      }

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error, 'Failed to submit suggestion to Discord');
      return reply.status(500).send({ error: 'Failed to submit suggestion' });
    }
  });
};

export default suggestionsRoute; 