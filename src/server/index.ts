import { createApp } from './app.ts';
import { config } from './config.ts';
import { sequelize } from './db.ts';
import { migrate } from './migrate.ts';

const { app, store } = createApp();

await sequelize.authenticate();
await migrate();
await store.sync();

const server = app.listen(config.port, () => {
  console.info(`[kiddin] API listening on http://localhost:${config.port} (${config.db.dialect})`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => {
      void sequelize.close().finally(() => process.exit(0));
    });
  });
}
