/*
  Warnings:

  - You are about to drop the column `loginUrl` on the `Credential` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "loginUrl";

-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "loginUrl" TEXT;
