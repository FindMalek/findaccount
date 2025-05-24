// Generate a random encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
}

// Convert string to ArrayBuffer
function stringToArrayBuffer(str: string): Uint8Array {
  const encoder = new TextEncoder()
  return encoder.encode(str)
}

// Convert ArrayBuffer to string
function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder()
  return decoder.decode(buffer)
}

// Encrypt data
export async function encryptData(
  data: string,
  key: CryptoKey
): Promise<{
  encryptedData: string
  iv: string
}> {
  // Generate a random initialization vector
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  // Convert data to ArrayBuffer
  const dataBuffer = stringToArrayBuffer(data)

  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    dataBuffer
  )

  // Convert encrypted data and IV to base64 strings
  const encryptedData = btoa(
    String.fromCharCode(...new Uint8Array(encryptedBuffer))
  )
  const ivString = btoa(String.fromCharCode(...iv))

  return {
    encryptedData,
    iv: ivString,
  }
}

// Decrypt data
export async function decryptData(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  // Convert base64 strings back to ArrayBuffers
  const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) =>
    c.charCodeAt(0)
  )
  const ivBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0))

  // Decrypt the data
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  )

  // Convert decrypted data back to string
  return arrayBufferToString(decryptedBuffer)
}

// Export key to string
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("raw", key)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

// Import key from string
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0))
  return await window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
}
