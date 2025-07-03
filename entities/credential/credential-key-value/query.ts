import { EncryptedDataEntity } from "@/entities/encryption"
import type { Prisma } from "@prisma/client"

export type CredentialKeyValuePairDbData =
  Prisma.CredentialKeyValuePairGetPayload<{
    include: ReturnType<typeof CredentialKeyValuePairQuery.getInclude>
  }>

export type CredentialKeyValuePairSimpleDbData =
  Prisma.CredentialKeyValuePairGetPayload<{
    include: ReturnType<typeof CredentialKeyValuePairQuery.getSimpleInclude>
  }>

export class CredentialKeyValuePairQuery {
  static getSimpleSelect() {
    return {
      id: true,
      key: true,
      valueEncryptionId: true,
      credentialMetadataId: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.CredentialKeyValuePairSelect
  }

  static getSimpleInclude() {
    return {} satisfies Prisma.CredentialKeyValuePairInclude
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      valueEncryption: true,
      credentialMetadata: true,
    } satisfies Prisma.CredentialKeyValuePairInclude
  }

  static getSelect() {
    return {
      ...this.getSimpleSelect(),
      valueEncryption: {
        select: EncryptedDataEntity.getSelect(),
      },
    } satisfies Prisma.CredentialKeyValuePairSelect
  }
}
