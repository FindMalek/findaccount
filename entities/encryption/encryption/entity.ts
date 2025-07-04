import { EncryptedDataSimpleRo } from "@/schemas/encryption"

import { EncryptedDataEntitySimpleDbData } from "./query"

export class EncryptedDataEntity {
  static getSimpleRo(
    entity: EncryptedDataEntitySimpleDbData
  ): EncryptedDataSimpleRo {
    return {
      id: entity.id,

      iv: entity.iv,
      encryptedValue: entity.encryptedValue,
      encryptionKey: entity.encryptionKey,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }
}
