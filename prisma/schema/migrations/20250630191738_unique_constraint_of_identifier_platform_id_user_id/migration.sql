/*
  Warnings:

  - A unique constraint covering the columns `[identifier,platformId,userId]` on the table `credential` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "credential_identifier_platformId_userId_key" ON "credential"("identifier", "platformId", "userId");
