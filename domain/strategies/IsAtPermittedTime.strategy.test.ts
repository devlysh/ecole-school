import {
  IsAtPermittedTimeStrategy,
  PermittedTimeDirection,
  PermittedTimeUnit,
} from "./IsAtPermittedTime.strategy";

describe("IsInPermittedTimeStrategy", () => {
  it("should return true for a dateTime within the permitted time range (days after)", () => {
    const strategy = new IsAtPermittedTimeStrategy(
      2,
      PermittedTimeUnit.DAYS,
      PermittedTimeDirection.AFTER,
      new Date("2023-01-10T09:00:00Z")
    );

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-12T09:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-12T10:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-13T10:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2024-01-10T10:00:00Z") })
    ).toBe(true);
  });

  it("should return false for a dateTime outside the permitted time range (days after)", () => {
    const strategy = new IsAtPermittedTimeStrategy(
      2,
      PermittedTimeUnit.DAYS,
      PermittedTimeDirection.AFTER,
      new Date("2023-01-10T09:00:00Z")
    );

    expect(
      strategy.isAvailable({ dateTime: new Date("2022-01-08T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-08T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-09T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-11T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-12T08:00:00Z") })
    ).toBe(false);
  });
});
