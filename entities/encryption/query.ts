import { type Prisma } from "@prisma/client"

export type EncryptedDataEntitySimpleDbData = Prisma.EncryptedDataGetPayload<{
  include: ReturnType<typeof EncryptedDataQuery.getSimpleInclude>
}>

export class EncryptedDataQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.EncryptedDataInclude
  }
}
