import { EncryptedDataEntity } from "@/entities/encryption"
import {
  type CredentialKeyValuePairSimpleRo,
  type CredentialKeyValuePairWithEncryptionRo,
} from "@/schemas/credential/credential-key-value"

import {
  CredentialKeyValuePairDbData,
  CredentialKeyValuePairSimpleDbData,
} from "./query"

export class CredentialKeyValuePairEntity {
  static getSimpleRo(
    credentialKeyValuePair: CredentialKeyValuePairSimpleDbData
  ): CredentialKeyValuePairSimpleRo {
    return {
      id: credentialKeyValuePair.id,
      key: credentialKeyValuePair.key,
      valueEncryptionId: credentialKeyValuePair.valueEncryptionId,
      credentialMetadataId: credentialKeyValuePair.credentialMetadataId,
      createdAt: credentialKeyValuePair.createdAt,
      updatedAt: credentialKeyValuePair.updatedAt,
    }
  }

  static getWithEncryptionRo(
    credentialKeyValuePair: CredentialKeyValuePairDbData
  ): CredentialKeyValuePairWithEncryptionRo {
    return {
      id: credentialKeyValuePair.id,
      key: credentialKeyValuePair.key,
      valueEncryption: EncryptedDataEntity.getSimpleRo(
        credentialKeyValuePair.valueEncryption
      ),
      credentialMetadataId: credentialKeyValuePair.credentialMetadataId,
      createdAt: credentialKeyValuePair.createdAt,
      updatedAt: credentialKeyValuePair.updatedAt,
    }
  }
}
