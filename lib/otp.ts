/**
 * OTP (One-Time Password) generation and verification
 * For email verification in preferences page
 * Now uses database for persistent storage
 */

import { prisma } from './prisma'

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Store OTP for an email (database version)
 * @param email - User's email address
 * @returns Generated OTP code
 */
export async function createOTP(email: string): Promise<string> {
  const code = generateOTP()
  const emailLower = email.toLowerCase()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // Delete any existing OTPs for this email
  await prisma.oTP.deleteMany({
    where: { email: emailLower }
  })

  // Create new OTP record in database
  await prisma.oTP.create({
    data: {
      email: emailLower,
      code,
      expiresAt,
      attempts: 0
    }
  })

  console.log(`🔐 OTP created for ${email}: ${code} (expires in 10 min)`)
  
  return code
}

/**
 * Verify OTP code (database version) - Does NOT delete OTP on success
 * @param email - User's email address
 * @param code - OTP code to verify
 * @param deleteOnSuccess - If true, delete OTP after successful verification (default: false)
 * @returns true if valid, false otherwise
 */
export async function verifyOTP(
  email: string, 
  code: string, 
  deleteOnSuccess: boolean = false
): Promise<{ valid: boolean; message: string }> {
  const emailLower = email.toLowerCase()
  
  // Find OTP record from database
  const record = await prisma.oTP.findFirst({
    where: { email: emailLower }
  })

  console.log(`🔍 OTP verification attempt:`, {
    email: emailLower,
    inputCode: code,
    storedCode: record?.code,
    hasRecord: !!record,
    attempts: record?.attempts,
    deleteOnSuccess
  })

  if (!record) {
    return { valid: false, message: 'Doğrulama kodu bulunamadı. Lütfen yeni kod isteyin.' }
  }

  // Check expiration
  if (new Date() > record.expiresAt) {
    await prisma.oTP.delete({
      where: { id: record.id }
    })
    return { valid: false, message: 'Doğrulama kodu süresi doldu. Lütfen yeni kod isteyin.' }
  }

  // Check attempts
  if (record.attempts >= 3) {
    await prisma.oTP.delete({
      where: { id: record.id }
    })
    return { valid: false, message: 'Çok fazla yanlış deneme. Lütfen yeni kod isteyin.' }
  }

  // Verify code
  if (record.code !== code.trim()) {
    // Increment attempt counter
    await prisma.oTP.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 }
    })
    console.log(`❌ Wrong code. Expected: ${record.code}, Got: ${code.trim()}`)
    return { valid: false, message: `Yanlış kod. Kalan deneme: ${3 - (record.attempts + 1)}` }
  }

  // Success
  if (deleteOnSuccess) {
    // Delete OTP from database
    await prisma.oTP.delete({
      where: { id: record.id }
    })
    console.log(`✅ OTP verified and deleted for ${email}`)
  } else {
    console.log(`✅ OTP verified (not deleted) for ${email}`)
  }
  
  return { valid: true, message: 'Doğrulama başarılı' }
}

/**
 * Delete OTP for a specific email
 * @param email - User's email address
 */
export async function deleteOTP(email: string): Promise<void> {
  await prisma.oTP.deleteMany({
    where: { email: email.toLowerCase() }
  })
  console.log(`🗑️ OTP deleted for ${email}`)
}

/**
 * Check if OTP exists and is valid for an email
 */
export async function hasValidOTP(email: string): Promise<boolean> {
  const record = await prisma.oTP.findFirst({
    where: { email: email.toLowerCase() }
  })
  
  if (!record) return false
  
  if (new Date() > record.expiresAt) {
    await prisma.oTP.delete({
      where: { id: record.id }
    })
    return false
  }
  
  return true
}

/**
 * Clean up expired OTPs from database
 */
export async function cleanupExpiredOTPs() {
  const result = await prisma.oTP.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
  
  if (result.count > 0) {
    console.log(`🧹 Cleaned up ${result.count} expired OTPs`)
  }
}

/**
 * Get OTP info (for testing/debugging)
 */
export async function getOTPInfo(email: string) {
  return await prisma.oTP.findFirst({
    where: { email: email.toLowerCase() }
  })
}
