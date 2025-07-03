import { type Prisma } from "@prisma/client"

export type CredentialEntitySimpleDbData = Prisma.CredentialGetPayload<{
  include: ReturnType<typeof CredentialQuery.getSimpleInclude>
}>

export type CredentialEntityIncludeDbData = Prisma.CredentialGetPayload<{
  include: ReturnType<typeof CredentialQuery.getInclude>
}>

export class CredentialQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.CredentialInclude
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      tags: true,
    } satisfies Prisma.CredentialInclude
  }
}
