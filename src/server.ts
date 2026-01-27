import { buildApp } from './app';
import * as dotenv from 'dotenv';
import { initSocket } from './lib/socket';
import { initOrderWorker } from './modules/orders/orders.queue';

dotenv.config();

const start = async () => {
  const app = await buildApp();
  const port = parseInt(process.env.PORT || '3000');

  try {
    await app.ready();
    // Initialize Socket.io with the raw http server
    initSocket(app.server, app);

    // Initialize Workers
    initOrderWorker();

    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
