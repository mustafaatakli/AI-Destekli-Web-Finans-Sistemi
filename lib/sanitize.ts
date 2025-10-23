/**
 * Input sanitization utilities
 * Prevents XSS, HTML injection, and malicious input
 */

/**
 * Sanitize email address
 * Removes potentially dangerous characters
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''
  
  // Convert to lowercase and trim
  let clean = email.toLowerCase().trim()
  
  // Remove any HTML tags
  clean = clean.replace(/<[^>]*>/g, '')
  
  // Remove script tags and javascript
  clean = clean.replace(/javascript:/gi, '')
  clean = clean.replace(/on\w+=/gi, '')
  
  // Only allow valid email characters
  clean = clean.replace(/[^a-z0-9@._+-]/g, '')
  
  return clean
}

/**
 * Sanitize string for database storage
 * Removes HTML and script injection attempts
 */
export function sanitizeString(input: string): string {
  if (!input) return ''
  
  // Trim whitespace
  let clean = input.trim()
  
  // Remove HTML tags
  clean = clean.replace(/<[^>]*>/g, '')
  
  // Remove script tags
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove javascript: and data: protocols
  clean = clean.replace(/javascript:/gi, '')
  clean = clean.replace(/data:/gi, '')
  
  // Remove event handlers
  clean = clean.replace(/on\w+\s*=/gi, '')
  
  // Limit length to prevent DoS
  if (clean.length > 1000) {
    clean = clean.substring(0, 1000)
  }
  
  return clean
}

/**
 * Sanitize array of strings
 */
export function sanitizeArray(arr: string[]): string[] {
  if (!Array.isArray(arr)) return []
  return arr.map(item => sanitizeString(item)).filter(item => item.length > 0)
}

/**
 * Validate and sanitize category
 * Only allows predefined categories
 */
export function sanitizeCategory(category: string): string | null {
  const allowedCategories = ['altin', 'dolar', 'euro', 'doviz', 'borsa']
  const clean = category.toLowerCase().trim()
  
  if (allowedCategories.includes(clean)) {
    return clean
  }
  
  return null
}

/**
 * Validate and sanitize categories array
 */
export function sanitizeCategories(categories: string[]): string[] {
  if (!Array.isArray(categories)) return []
  
  const sanitized = categories
    .map(cat => sanitizeCategory(cat))
    .filter((cat): cat is string => cat !== null)
  
  // Remove duplicates
  return [...new Set(sanitized)]
}

/**
 * Sanitize notification hour
 * Ensures value is between 0-23
 */
export function sanitizeHour(hour: any): number {
  const num = parseInt(hour)
  
  if (isNaN(num)) return 21 // Default
  if (num < 0) return 0
  if (num > 23) return 23
  
  return num
}

/**
 * Sanitize notification frequency
 * Only allows predefined values
 */
export function sanitizeFrequency(frequency: string): string {
  const allowed = ['once', 'twice', 'daily', 'three_times']
  const clean = frequency.toLowerCase().trim()
  
  if (allowed.includes(clean)) {
    return clean
  }
  
  return 'once' // Default
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Check if string contains SQL injection attempts
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/i,
    /\b(drop|delete|truncate|alter)\b.*\b(table|database)\b/i,
    /'.*--/,
    /;\s*(drop|delete|update|insert)/i,
    /\bexec(\s|\()/i,
    /\bscript\b/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Rate limit check (simple in-memory)
 * For production, use Redis
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false // Rate limit exceeded
  }
  
  record.count++
  return true
}

/**
 * Clean old rate limit records
 * Should be called periodically
 */
export function cleanupRateLimits() {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}
