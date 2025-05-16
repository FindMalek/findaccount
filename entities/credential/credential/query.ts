import { type Prisma } from "@prisma/client"

export type CredentialEntityDbData = Prisma.CredentialGetPayload<{
  include: ReturnType<typeof CredentialQuery.getSimpleInclude>
}>

export class CredentialQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.CredentialInclude
  }
}
