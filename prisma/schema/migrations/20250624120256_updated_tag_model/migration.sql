/*
  Warnings:

  - Made the column `color` on table `tag` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tag" ALTER COLUMN "color" SET NOT NULL;
