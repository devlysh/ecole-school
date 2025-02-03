import { AvailableSlotsRepository } from "./AvailableSlots.repository";
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

    const repo = new AvailableSlotsRepository();
    const result = await repo.findAll();

    expect(prisma.availableSlot.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSlots);
  });

  it("fetchRecurringSlots should retrieve slots with an rrule", async () => {
    const mockSlots = [{ id: 2, teacherId: 202, rrule: "FREQ=DAILY" }];
    (prisma.availableSlot.findMany as jest.Mock).mockResolvedValue(mockSlots);

    const repo = new AvailableSlotsRepository();
    const result = await repo.findRecurringSlots();

    expect(prisma.availableSlot.findMany).toHaveBeenCalledWith({
      where: {
        rrule: {
          not: null,
        },
      },
    });
    expect(result).toEqual(mockSlots);
  });

  it("fetchByTeacherId should retrieve slots for a specific teacher", async () => {
    const mockSlots = [
      { id: 1, teacherId: 101, startTime: new Date(), endTime: new Date() },
    ];
    (prisma.availableSlot.findMany as jest.Mock).mockResolvedValue(mockSlots);

    const repo = new AvailableSlotsRepository();
    const result = await repo.findByTeacherId(101);

    expect(prisma.availableSlot.findMany).toHaveBeenCalledWith({
      where: {
        teacherId: 101,
      },
    });
    expect(result).toEqual(mockSlots);
  });
});
