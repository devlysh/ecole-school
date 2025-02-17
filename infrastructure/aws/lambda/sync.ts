import { SyncService } from "../../../domain/services/Sync.service";
import logger from "../../../src/lib/logger";

export const handler = async () => {
  try {
    const syncService = new SyncService();
    await syncService.sync();
    logger.info("Synced successfully.");
  } catch (err: unknown) {
    logger.error(err, "Error synchronizing");
    throw err;
  }
};
