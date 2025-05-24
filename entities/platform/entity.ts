import { PlatformSimpleRo } from "@/schemas/platform"

import { PlatformEntitySimpleDbData } from "./query"

export class PlatformEntity {
  static getSimpleRo(entity: PlatformEntitySimpleDbData): PlatformSimpleRo {
    return {
      id: entity.id,

      name: entity.name,
      status: entity.status,

      logo: entity.logo,
      loginUrl: entity.loginUrl,

      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      userId: entity.userId,
    }
  }
}
