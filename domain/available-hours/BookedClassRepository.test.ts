import { BookedClassRepository } from "./BookedClassRepository";
import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  bookedClass: {
    findMany: jest.fn(),
  },
}));

describe("BookedClassRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAll should retrieve all booked classes", async () => {
    const mockBookedClasses = [{ id: 1, teacherId: 101 }];
    (prisma.bookedClass.findMany as jest.Mock).mockResolvedValue(
      mockBookedClasses
    );

    const repo = new BookedClassRepository();
    const result = await repo.fetchAll();

    expect(prisma.bookedClass.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockBookedClasses);
  });

  it("fetchForTeacher should retrieve classes by teacherId", async () => {
    const teacherId = 123;
    const mockData = [{ id: 1, teacherId: 123 }];
    (prisma.bookedClass.findMany as jest.Mock).mockResolvedValue(mockData);

    const repo = new BookedClassRepository();
    const result = await repo.fetchForTeacher(teacherId);

    expect(prisma.bookedClass.findMany).toHaveBeenCalledWith({
      where: { teacherId },
    });
    expect(result).toEqual(mockData);
  });
});
