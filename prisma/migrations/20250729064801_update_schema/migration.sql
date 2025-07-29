/*
  Warnings:

  - You are about to drop the column `completed` on the `objectives` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ObjectiveStatus" AS ENUM ('ACTIVE', 'ACHIEVED', 'ABORTED', 'INTERRUPTED', 'ARCHIVED', 'PAUSED');

-- AlterTable
ALTER TABLE "objectives" DROP COLUMN "completed",
ADD COLUMN     "status" "ObjectiveStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "objectiveId" TEXT;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "objectives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
