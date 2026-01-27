import { FastifyRequest, FastifyReply } from 'fastify';

export const verifyJwt = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
};

export const verifyAdmin = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.user as { role: string };
  if (user.role !== 'admin') {
    reply.code(403).send({ message: 'Forbidden: Admin access required' });
  }
};
