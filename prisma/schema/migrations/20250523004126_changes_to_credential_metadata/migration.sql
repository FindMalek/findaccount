/*
  Warnings:

  - You are about to drop the column `accountId` on the `CredentialMetadata` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `CredentialMetadata` table. All the data in the column will be lost.
  - You are about to drop the column `iban` on the `CredentialMetadata` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CredentialMetadata" DROP COLUMN "accountId",
DROP COLUMN "bankName",
DROP COLUMN "iban",
ADD COLUMN     "phoneNumber" TEXT;
