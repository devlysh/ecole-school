-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;