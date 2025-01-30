class ErrorWithMetadata extends Error {
  public metadata?: Record<string, unknown>;

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message);
    this.metadata = metadata;
  }
}

export class SlotIsNotAvailableError extends ErrorWithMetadata {
  constructor(metadata?: Record<string, unknown>) {
    super("Slot is not available", metadata);
    this.name = "SlotIsNotAvailableError";
  }
}

// Custom error class for settings not found
export class SettingsNotFoundError extends Error {
  constructor(message: string = "Settings not found") {
    super(message);
    this.name = "SettingsNotFoundError";
  }
}

// Custom error class for unauthorized access
export class UnauthorizedError extends ErrorWithMetadata {
  constructor(
    message: string = "Unauthorized access",
    metadata?: Record<string, unknown>
  ) {
    super(message, metadata);
    this.name = "UnauthorizedError";
  }
}

export class EmailIsMissingError extends Error {
  constructor(message: string = "Email is missing") {
    super(message);
    this.name = "EmailIsMissingError";
  }
}

export class UserNotFoundError extends ErrorWithMetadata {
  constructor(
    message: string = "User not found",
    metadata?: Record<string, unknown>
  ) {
    super(message, metadata);
    this.name = "UserNotFoundError";
  }
}

export class BookedClassNotFoundError extends ErrorWithMetadata {
  constructor(metadata?: Record<string, unknown>) {
    super("Booked class not found", metadata);
    this.name = "BookedClassNotFoundError";
  }
}

export class BadRequestError extends ErrorWithMetadata {
  constructor(
    message: string = "Bad request",
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = "BadRequestError";
    this.metadata = metadata;
  }
}
