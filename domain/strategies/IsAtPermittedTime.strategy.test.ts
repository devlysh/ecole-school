import {
  IsAtPermittedTimeStrategy,
  PermittedTimeDirection,
  PermittedTimeUnit,
} from "./IsAtPermittedTime.strategy";

describe("IsAtPermittedTimeStrategy", () => {
  describe("PermittedTimeDirection.AFTER", () => {
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
        strategy.isAvailable({ dateTime: new Date("2023-01-13T10:00:00Z") })
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
        strategy.isAvailable({ dateTime: new Date("2023-01-09T09:00:00Z") })
      ).toBe(false);

      expect(
        strategy.isAvailable({ dateTime: new Date("2023-01-10T09:00:00Z") })
      ).toBe(false);
    });

    it("should return true for a dateTime within the permitted time range (hours after)", () => {
      const strategy = new IsAtPermittedTimeStrategy(
        5,
        PermittedTimeUnit.HOURS,
        PermittedTimeDirection.AFTER,
        new Date("2023-01-10T09:00:00Z")
      );

      expect(
        strategy.isAvailable({ dateTime: new Date("2023-01-10T14:00:00Z") })
      ).toBe(true);
    });

    it("should return false for a dateTime outside the permitted time range (hours after)", () => {
      const strategy = new IsAtPermittedTimeStrategy(
        5,
        PermittedTimeUnit.HOURS,
        PermittedTimeDirection.AFTER,
        new Date("2023-01-10T09:00:00Z")
      );

      expect(
        strategy.isAvailable({ dateTime: new Date("2023-01-10T13:00:00Z") })
      ).toBe(false);
    });
  });

  describe("PermittedTimeDirection.BEFORE", () => {
    it("should return true for a dateTime within the permitted time range (days before)", () => {
      const strategy = new IsAtPermittedTimeStrategy(
        2,
        PermittedTimeUnit.DAYS,
        PermittedTimeDirection.BEFORE,
        new Date("2023-01-10T09:00:00Z")
      );

      expect(
        strategy.isAvailable({ dateTime: new Date("2023-01-07T09:00:00Z") })
      ).toBe(true);

      expect(
        strategy.isAvailable({ dateTime: new Date("2023-01-08T09:00:00Z") })
      ).toBe(true);
    });

    it("should return false for a dateTime outside the permitted time range (days before)", () => {
      const strategy = new IsAtPermittedTimeStrategy(
        2,
        PermittedTimeUnit.DAYS,
        PermittedTimeDirection.BEFORE,
        new Date("2023-01-10T09:00:00Z")
      );

      expect(
        strategy.isAvailable({ dateTime: new Date("2023-01-09T09:00:00Z") })
      ).toBe(false);

      expect(
        strategy.isAvailable({ dateTime: new Date("2023-01-10T10:00:00Z") })
      ).toBe(false);
    });

    it("should return true for a dateTime within the permitted time range (hours before)", () => {
      const strategy = new IsAtPermittedTimeStrategy(
        5,
        PermittedTimeUnit.HOURS,
        PermittedTimeDirection.BEFORE,
        new Date("2023-01-10T09:00:00Z")
      );

      expect(
        strategy.isAvailable({ dateTime: new Date("2023-01-10T04:00:00Z") })
      ).toBe(true);
    });

    it("should return false for a dateTime outside the permitted time range (hours before)", () => {
      const strategy = new IsAtPermittedTimeStrategy(
        5,
        PermittedTimeUnit.HOURS,
        PermittedTimeDirection.BEFORE,
        new Date("2023-01-10T09:00:00Z")
      );

      expect(
        strategy.isAvailable({ dateTime: new Date("2023-01-10T05:00:00Z") })
      ).toBe(false);
    });
  });

  it("should return false if dateTime is not provided", () => {
    const strategy = new IsAtPermittedTimeStrategy(
      2,
      PermittedTimeUnit.DAYS,
      PermittedTimeDirection.AFTER,
      new Date("2023-01-10T09:00:00Z")
    );

    expect(strategy.isAvailable({})).toBe(false);
  });
});
