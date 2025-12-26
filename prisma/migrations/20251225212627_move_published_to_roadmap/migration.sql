/*
  Warnings:

  - You are about to drop the column `isPublished` on the `RoadmapStep` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Roadmap" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."RoadmapStep" DROP COLUMN "isPublished";
