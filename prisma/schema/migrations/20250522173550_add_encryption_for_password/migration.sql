/*
  Warnings:

  - Added the required column `encryptionKey` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptionKey` to the `CredentialHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `CredentialHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "encryptionKey" TEXT NOT NULL,
ADD COLUMN     "iv" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CredentialHistory" ADD COLUMN     "encryptionKey" TEXT NOT NULL,
ADD COLUMN     "iv" TEXT NOT NULL;
