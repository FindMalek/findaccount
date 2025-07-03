/*
  Warnings:

  - You are about to drop the column `otherInfo` on the `credential_metadata` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "credential_metadata" DROP COLUMN "otherInfo";

-- CreateTable
CREATE TABLE "credential_key_value_pair" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueEncryptionId" TEXT NOT NULL,
    "credentialMetadataId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_key_value_pair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credential_key_value_pair_credentialMetadataId_idx" ON "credential_key_value_pair"("credentialMetadataId");

-- CreateIndex
CREATE INDEX "credential_key_value_pair_valueEncryptionId_idx" ON "credential_key_value_pair"("valueEncryptionId");

-- AddForeignKey
ALTER TABLE "credential_key_value_pair" ADD CONSTRAINT "credential_key_value_pair_valueEncryptionId_fkey" FOREIGN KEY ("valueEncryptionId") REFERENCES "encrypted_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_key_value_pair" ADD CONSTRAINT "credential_key_value_pair_credentialMetadataId_fkey" FOREIGN KEY ("credentialMetadataId") REFERENCES "credential_metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
