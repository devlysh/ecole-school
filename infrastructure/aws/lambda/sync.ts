import { SyncService } from "../../../domain/services/Sync.service";

export const handler = async () => {
  try {
    const syncService = new SyncService();
    await syncService.sync();
    console.log("Synced successfully.");
  } catch (error) {
    console.error("Error synchronizing", error);
  }
};
