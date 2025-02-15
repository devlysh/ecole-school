import {
  OutsideRestrictedTimeRangeStrategy,
  RestrictedTimeDirection,
  RestrictedTimeUnit,
} from "./OutsideRestrictedTimeRange.strategy";

describe("BookingWindowStrategy", () => {
  it("should return true for a slot that is at least two days in the future", () => {
    const strategy = new OutsideRestrictedTimeRangeStrategy(
      2,
      RestrictedTimeUnit.DAYS,
      RestrictedTimeDirection.AFTER,
      new Date("2023-01-10T09:00:00Z")
    );
    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-09T09:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T08:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-11T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-12T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-12T10:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-13T09:00:00Z") })
    ).toBe(true);
  });

  it("should return false for a slot that is less than two days in the past", () => {
    const strategy = new OutsideRestrictedTimeRangeStrategy(
      2,
      RestrictedTimeUnit.DAYS,
      RestrictedTimeDirection.BEFORE,
      new Date("2023-01-10T09:00:00Z")
    );

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-08T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-09T08:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-09T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T08:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T10:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-11T09:00:00Z") })
    ).toBe(true);
  });

  it("should return true for a slot that is at least two hours in the future", () => {
    const strategy = new OutsideRestrictedTimeRangeStrategy(
      2,
      RestrictedTimeUnit.HOURS,
      RestrictedTimeDirection.AFTER,
      new Date("2023-01-10T09:00:00Z")
    );

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T07:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T08:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T10:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T11:01:00Z") })
    ).toBe(true);
  });

  it("should return false for a slot that is less than two hours in the past", () => {
    const strategy = new OutsideRestrictedTimeRangeStrategy(
      2,
      RestrictedTimeUnit.HOURS,
      RestrictedTimeDirection.BEFORE,
      new Date("2023-01-10T09:00:00Z")
    );

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T06:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T07:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T08:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T09:00:00Z") })
    ).toBe(false);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T10:00:00Z") })
    ).toBe(true);

    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-10T11:00:00Z") })
    ).toBe(true);
  });
});
