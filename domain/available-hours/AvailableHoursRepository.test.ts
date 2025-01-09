import { AvailableHoursRepository } from "./AvailableHoursRepository";
import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  availableSlot: {
    findMany: jest.fn(),
  },
}));

describe("AvailableHoursRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAll should retrieve all available slots", async () => {
    const mockSlots = [{ id: 1, teacherId: 101 }];
    (prisma.availableSlot.findMany as jest.Mock).mockResolvedValue(mockSlots);

    const repo = new AvailableHoursRepository();
    const result = await repo.fetchAll();

    expect(prisma.availableSlot.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSlots);
  });

  it("fetchFixedScheduleSlots should retrieve slots with an rrule", async () => {
    const mockSlots = [{ id: 2, teacherId: 202, rrule: "FREQ=DAILY" }];
    (prisma.availableSlot.findMany as jest.Mock).mockResolvedValue(mockSlots);

    const repo = new AvailableHoursRepository();
    const result = await repo.fetchFixedScheduleSlots();

    expect(prisma.availableSlot.findMany).toHaveBeenCalledWith({
      where: {
        rrule: {
          not: null,
        },
      },
    });
    expect(result).toEqual(mockSlots);
  });
});
