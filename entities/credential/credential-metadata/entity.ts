import { CredentialMetadataSimpleRo } from "@/schemas/credential"

import { CredentialMetadataEntitySimpleDbData } from "./query"

export class CredentialMetadataEntity {
  static getSimpleRo(
    entity: CredentialMetadataEntitySimpleDbData
  ): CredentialMetadataSimpleRo {
    return {
      id: entity.id,
      recoveryEmail: entity.recoveryEmail,
      phoneNumber: entity.phoneNumber,
      otherInfo: entity.otherInfo,
      has2FA: entity.has2FA,
      credentialId: entity.credentialId,
    }
  }
}
