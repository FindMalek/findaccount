import { CredentialSimpleRo } from "@/schemas/credential"

import { CredentialEntityDbData } from "./query"

export class CredentialEntity {
  static getSimpleRo(entity: CredentialEntityDbData): CredentialSimpleRo {
    return {
      id: entity.id,

      username: entity.username,

      // TODO: Consider masking or partial display for ROs if sensitive
      password: entity.password,

      status: entity.status,

      description: entity.description,
      loginUrl: entity.loginUrl,

      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      userId: entity.userId,
      platformId: entity.platformId,
      containerId: entity.containerId,
    }
  }
}
