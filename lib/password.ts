export function generatePassword(length: number = 16): string {
  const charset = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    special: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  }

  // Ensure at least one character from each category
  const password = [
    charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)],
    charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)],
    charset.numbers[Math.floor(Math.random() * charset.numbers.length)],
    charset.special[Math.floor(Math.random() * charset.special.length)],
  ]

  // Fill the rest with random characters from all categories
  const allChars =
    charset.lowercase + charset.uppercase + charset.numbers + charset.special
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)])
  }

  // Shuffle the password array
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[password[i], password[j]] = [password[j], password[i]]
  }

  return password.join("")
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number // 0-4
  feedback: string
} {
  let score = 0
  const feedback = []

  if (password.length >= 12) {
    score++
  } else {
    feedback.push("Password should be at least 12 characters long")
  }

  if (/[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push("Include uppercase letters")
  }

  if (/[a-z]/.test(password)) {
    score++
  } else {
    feedback.push("Include lowercase letters")
  }

  if (/[0-9]/.test(password)) {
    score++
  } else {
    feedback.push("Include numbers")
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++
  } else {
    feedback.push("Include special characters")
  }

  return {
    score,
    feedback: feedback.join(", "),
  }
}
