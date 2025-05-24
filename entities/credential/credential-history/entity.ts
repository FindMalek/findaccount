import { CredentialHistorySimpleRo } from "@/schemas/credential"

import { CredentialHistoryEntitySimpleDbData } from "./query"

export class CredentialHistoryEntity {
  static getSimpleRo(
    entity: CredentialHistoryEntitySimpleDbData
  ): CredentialHistorySimpleRo {
    return {
      id: entity.id,

      // TODO: Consider masking or partial display for ROs if sensitive
      oldPassword: entity.oldPassword,

      // TODO: Consider masking or partial display for ROs if sensitive
      newPassword: entity.newPassword,

      encryptionKey: entity.encryptionKey,
      iv: entity.iv,

      changedAt: entity.changedAt,

      userId: entity.userId,
      credentialId: entity.credentialId,
    }
  }
}
