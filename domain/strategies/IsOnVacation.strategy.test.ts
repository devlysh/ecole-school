import { IsOnVacationStrategy } from "./IsOnVacation.strategy";
import { AvailableSlot } from "@prisma/client";

describe("VacationStrategy", () => {
  it("should return true if the slot is not during a vacation", () => {
    const strategy = new IsOnVacationStrategy([], []);
    expect(
      strategy.isAvailable({ dateTime: new Date("2023-01-01T09:00:00Z") })
    ).toBe(true);
  });
});
