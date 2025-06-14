/**
 * Comprehensive card expiry date handling utilities
 *
 * This module provides all the necessary functions for handling card expiry dates
 * including parsing, validation, conversion, and form handling.
 */

/**
 * Card expiry date utilities for parsing, validation, and conversion
 */
export const CardExpiryDateUtils = {
  /**
   * Parse MM/YY format string to Date object for card expiry dates
   * @param mmyy String in MM/YY format
   * @returns Date object set to the last day of the specified month/year, or undefined if invalid
   */
  parseMMYYToDate(mmyy: string): Date | undefined {
    if (!mmyy || typeof mmyy !== "string") return undefined

    // Remove any whitespace and check for slash
    const trimmed = mmyy.trim()
    if (!trimmed.includes("/")) return undefined

    const [month, year] = trimmed.split("/")

    // Validate month and year exist
    if (!month || !year) return undefined

    // Validate month and year are numbers
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)

    if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
      return undefined
    }

    // Convert 2-digit year to 4-digit year
    // Assume years 00-49 are 2000-2049, and 50-99 are 1950-1999
    const fullYear =
      yearNum < 50 ? 2000 + yearNum : yearNum < 100 ? 1900 + yearNum : yearNum

    // Create date for the last day of the month (more appropriate for expiry dates)
    // This helps with validation - cards expire at the end of the month
    const date = new Date(fullYear, monthNum - 1, 1) // Start with first day
    date.setMonth(date.getMonth() + 1) // Move to next month
    date.setDate(0) // Go back to last day of previous month

    // Validate the created date is valid
    if (isNaN(date.getTime())) {
      return undefined
    }

    return date
  },

  /**
   * Validate MM/YY format string
   * @param mmyy String to validate
   * @returns boolean indicating if the format is valid
   */
  isValidMMYYFormat(mmyy: string): boolean {
    if (!mmyy || typeof mmyy !== "string") return false

    // Allow MM/YY or M/YY format validation
    const mmyyRegex = /^(0?[1-9]|1[0-2])\/\d{2}$/
    return mmyyRegex.test(mmyy.trim())
  },

  /**
   * Convert any expiry date input (string or Date) to a valid Date object
   * @param expiryDate Input that can be either a MM/YY string or Date object
   * @returns Object with success flag, parsed date, and error message
   */
  processExpiryDate(expiryDate: string | Date | undefined | null): {
    success: boolean
    date?: Date
    error?: string
  } {
    // Handle null/undefined
    if (!expiryDate) {
      return {
        success: false,
        error: "Expiry date is required",
      }
    }

    // If it's already a Date object, validate it
    if (expiryDate instanceof Date) {
      if (isNaN(expiryDate.getTime())) {
        return {
          success: false,
          error: "Invalid date object",
        }
      }
      return {
        success: true,
        date: expiryDate,
      }
    }

    // If it's a string, validate format first
    if (typeof expiryDate === "string") {
      if (!this.isValidMMYYFormat(expiryDate)) {
        return {
          success: false,
          error: "Please enter a valid expiry date (MM/YY format)",
        }
      }

      // Try to parse it
      const parsedDate = this.parseMMYYToDate(expiryDate)
      if (!parsedDate) {
        return {
          success: false,
          error: "Unable to parse expiry date",
        }
      }

      return {
        success: true,
        date: parsedDate,
      }
    }

    return {
      success: false,
      error: "Invalid expiry date format",
    }
  },

  /**
   * Handle form field changes for expiry date inputs
   * @param value The input value from the form field
   * @param setValue Function to set the form value
   * @param fieldName The name of the field to set
   * @returns Object with success flag and any error message
   */
  handleFormExpiryChange(
    value: string,
    setValue: (fieldName: string, value: string | Date) => void,
    fieldName: string = "expiryDate"
  ): { success: boolean; error?: string } {
    console.log("Expiry change:", value) // Debug log

    // Remove spaces around the slash
    const cleanedValue = value.replace(/\s*\/\s*/g, "/")

    // Always set the string value first for immediate feedback
    setValue(fieldName, cleanedValue)

    // If the value is empty, don't try to parse
    if (!cleanedValue.trim()) {
      return { success: true }
    }

    // Try to parse and validate the date
    const result = this.processExpiryDate(cleanedValue)
    console.log("Parse result:", result) // Debug log

    if (result.success && result.date) {
      // If successfully parsed, use the Date object
      setValue(fieldName, result.date)
      console.log("Set date object:", result.date) // Debug log
      return { success: true }
    }

    // If parsing fails, keep the string value for validation
    return {
      success: false,
      error: result.error,
    }
  },

  /**
   * Server-side expiry date processing for database operations
   * @param expiryDate Input from validated data
   * @returns Date object ready for database storage
   * @throws Error if the date cannot be processed
   */
  processServerExpiryDate(expiryDate: string | Date): Date {
    const result = this.processExpiryDate(expiryDate)

    if (!result.success || !result.date) {
      throw new Error(result.error || "Invalid expiry date format")
    }

    return result.date
  },

  /**
   * Check if a card expiry date has passed
   * @param expiryDate The expiry date to check
   * @returns boolean indicating if the card has expired
   */
  isExpired(expiryDate: Date): boolean {
    const now = new Date()
    return expiryDate < now
  },

  /**
   * Format a Date object back to MM/YY string format
   * @param date Date object to format
   * @returns String in MM/YY format
   */
  formatDateToMMYY(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return ""
    }

    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear().toString().slice(-2)

    return `${month}/${year}`
  },
}

export default CardExpiryDateUtils
