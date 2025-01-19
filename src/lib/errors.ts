export class SlotIsNotAvailableError extends Error {
  constructor() {
    super("Slot is not available");
    this.name = "SlotIsNotAvailableError";
  }
}
