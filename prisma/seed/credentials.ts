import { AccountStatus, PrismaClient } from "@prisma/client"

import { saltAndHashPassword } from "./users"

// Mock encryption values for seeding purposes
const MOCK_ENCRYPTION_KEY = "mock_encryption_key_for_development_only"
const MOCK_IV = "mock_iv_value_for_development_only"

async function seedCredentials(prisma: PrismaClient) {
  console.log("🌱 Seeding credentials...")

  const users = await prisma.user.findMany()
  const platforms = await prisma.platform.findMany()
  const containers = await prisma.container.findMany()
  const tags = await prisma.tag.findMany()

  // Get the platform IDs
  const googlePlatform = platforms.find((p) => p.name === "Google")
  const githubPlatform = platforms.find((p) => p.name === "GitHub")
  const awsPlatform = platforms.find((p) => p.name === "AWS")
  const microsoftPlatform = platforms.find((p) => p.name === "Microsoft")

  // Ensure platforms are found
  if (
    !googlePlatform ||
    !githubPlatform ||
    !awsPlatform ||
    !microsoftPlatform
  ) {
    console.error("❌ Required platforms not found")
    return
  }

  // Prepare arrays for bulk insertion
  const credentialsData = []
  const credentialTagConnections = [] // Store credential-tag connections for later
  const metadataData = [] // Store metadata for later

  // Hash passwords in parallel to speed up seeding
  const googlePasswordPromise = saltAndHashPassword("GooglePass123!")
  const githubPasswordPromise = saltAndHashPassword("GitHubPass123!")
  const awsPasswordPromise = saltAndHashPassword("AWSPass123!")

  // Wait for all password hashes to complete
  const [googlePassword, githubPassword, awsPassword] = await Promise.all([
    googlePasswordPromise,
    githubPasswordPromise,
    awsPasswordPromise,
  ])

  for (const user of users) {
    // Find the user's containers
    const personalContainer = containers.find(
      (c) => c.userId === user.id && c.name === "Personal"
    )
    const workContainer = containers.find(
      (c) => c.userId === user.id && c.name === "Work"
    )

    // Find user's tags
    const importantTag = tags.find(
      (t) => t.userId === user.id && t.name === "Important"
    )
    const personalTag = tags.find(
      (t) => t.userId === user.id && t.name === "Personal"
    )
    const workTag = tags.find((t) => t.userId === user.id && t.name === "Work")

    // Google credential
    const googleCredId = `credential_google_${user.id}`
    credentialsData.push({
      id: googleCredId,
      username: user.email,
      password: googlePassword,
      encryptionKey: MOCK_ENCRYPTION_KEY,
      iv: MOCK_IV,
      status: AccountStatus.ACTIVE,
      description: "Google account",
      lastViewed: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      platformId: googlePlatform.id,
      userId: user.id,
      containerId: personalContainer?.id,
    })

    // Store tag connections for Google credential
    if (personalTag && importantTag) {
      credentialTagConnections.push({
        credentialId: googleCredId,
        tagIds: [personalTag.id, importantTag.id],
      })
    }

    // GitHub credential
    const githubCredId = `credential_github_${user.id}`
    credentialsData.push({
      id: githubCredId,
      username: `${user.name.replace(" ", "").toLowerCase()}`,
      password: githubPassword,
      encryptionKey: MOCK_ENCRYPTION_KEY,
      iv: MOCK_IV,
      status: AccountStatus.ACTIVE,
      description: "GitHub account",
      lastViewed: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      platformId: githubPlatform.id,
      userId: user.id,
      containerId: workContainer?.id,
    })

    // Store tag connections for GitHub credential
    if (workTag) {
      credentialTagConnections.push({
        credentialId: githubCredId,
        tagIds: [workTag.id],
      })
    }

    // Store metadata for GitHub credential
    metadataData.push({
      id: `metadata_github_${user.id}`,
      recoveryEmail: user.email,
      has2FA: true,
      credentialId: githubCredId,
    })

    // AWS credential if work container exists
    if (workContainer) {
      const awsCredId = `credential_aws_${user.id}`
      credentialsData.push({
        id: awsCredId,
        username: `${user.name.replace(" ", ".").toLowerCase()}@company.com`,
        password: awsPassword,
        encryptionKey: MOCK_ENCRYPTION_KEY,
        iv: MOCK_IV,
        status: AccountStatus.ACTIVE,
        description: "AWS account",
        updatedAt: new Date(),
        createdAt: new Date(),
        platformId: awsPlatform.id,
        userId: user.id,
        containerId: workContainer.id,
      })

      // Store tag connections for AWS credential
      if (workTag) {
        credentialTagConnections.push({
          credentialId: awsCredId,
          tagIds: [workTag.id],
        })
      }
    }
  }

  // Bulk create all credentials
  await prisma.credential.createMany({
    data: credentialsData,
  })

  // Bulk create all metadata
  await prisma.credentialMetadata.createMany({
    data: metadataData,
  })

  // Connect credentials to tags
  // We need to do this separately as createMany doesn't support relations
  for (const connection of credentialTagConnections) {
    await prisma.credential.update({
      where: { id: connection.credentialId },
      data: {
        tags: {
          connect: connection.tagIds.map((id) => ({ id })),
        },
      },
    })
  }

  console.log("✅ Credentials seeded successfully")
}

export { seedCredentials }
