import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { migrate } from "./db/migrate.js";
import { pool } from "./db/pool.js";
import { MysqlPositionRepository } from "./positions/mysqlPositionRepository.js";
import { PositionService } from "./positions/service.js";

const start = async () => {
  await migrate(pool);

  const repository = new MysqlPositionRepository(pool);
  const positionService = new PositionService(repository);
  const app = createApp({ positionService });

  app.listen(env.PORT, () => {
    console.log(`Backend API listening on http://localhost:${env.PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
