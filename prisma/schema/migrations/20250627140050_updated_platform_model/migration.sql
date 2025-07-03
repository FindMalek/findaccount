/*
  Warnings:

  - Made the column `logo` on table `platform` required. This step will fail if there are existing NULL values in that column.
  - Made the column `loginUrl` on table `platform` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "platform" ALTER COLUMN "logo" SET NOT NULL,
ALTER COLUMN "loginUrl" SET NOT NULL;
