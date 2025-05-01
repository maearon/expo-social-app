import { Dimensions, Platform } from "react-native"
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns"

// Device dimensions
const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window")

/**
 * Capitalizes the first letter of each word in a string
 * @param str String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return ""
  return str.replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Calculates width based on percentage of screen width
 * @param percentage Percentage of screen width
 * @returns Width in pixels
 */
export const wp = (percentage: number): number => {
  return (percentage * deviceWidth) / 100
}

/**
 * Calculates height based on percentage of screen height
 * @param percentage Percentage of screen height
 * @returns Height in pixels
 */
export const hp = (percentage: number): number => {
  return (percentage * deviceHeight) / 100
}

/**
 * Removes HTML tags from a string
 * @param html HTML string
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return ""
  return html.replace(/<[^>]*>?/gm, "")
}

/**
 * Formats a date string or timestamp to a readable format
 * @param date Date string, timestamp, or Date object
 * @param formatStr Format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: string | number | Date, formatStr = "MMM d, yyyy"): string => {
  if (!date) return ""

  let dateObj: Date

  if (typeof date === "string") {
    // Try to parse ISO string
    dateObj = parseISO(date)
  } else if (typeof date === "number") {
    // Assume timestamp
    dateObj = new Date(date)
  } else {
    // Already a Date object
    dateObj = date
  }

  if (!isValid(dateObj)) return "Invalid date"

  return format(dateObj, formatStr)
}

/**
 * Formats a date as a relative time (e.g., "5 minutes ago")
 * @param date Date string, timestamp, or Date object
 * @returns Relative time string
 */
export const formatTimeAgo = (date: string | number | Date): string => {
  if (!date) return ""

  let dateObj: Date

  if (typeof date === "string") {
    // Try to parse ISO string
    dateObj = parseISO(date)
  } else if (typeof date === "number") {
    // Assume timestamp
    dateObj = new Date(date)
  } else {
    // Already a Date object
    dateObj = date
  }

  if (!isValid(dateObj)) return "Invalid date"

  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text Text to truncate
 * @param length Maximum length (default: 100)
 * @returns Truncated text
 */
export const truncateText = (text: string, length = 100): string => {
  if (!text) return ""
  if (text.length <= length) return text
  return text.substring(0, length) + "..."
}

/**
 * Formats a number as currency
 * @param amount Number to format
 * @param currency Currency code (default: 'USD')
 * @param locale Locale (default: 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = "USD", locale = "en-US"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Formats a number with commas for thousands
 * @param number Number to format
 * @returns Formatted number string
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat().format(number)
}

/**
 * Validates an email address
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates a password strength
 * @param password Password to validate
 * @param minLength Minimum length (default: 8)
 * @returns Boolean indicating if password meets requirements
 */
export const isStrongPassword = (password: string, minLength = 8): boolean => {
  if (!password || password.length < minLength) return false

  // Check for at least one uppercase, one lowercase, and one number
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return hasUppercase && hasLowercase && hasNumber
}

/**
 * Checks if the device is an iOS device
 * @returns Boolean indicating if device is iOS
 */
export const isIOS = (): boolean => {
  return Platform.OS === "ios"
}

/**
 * Checks if the device is an Android device
 * @returns Boolean indicating if device is Android
 */
export const isAndroid = (): boolean => {
  return Platform.OS === "android"
}

/**
 * Generates a random string of specified length
 * @param length Length of string (default: 10)
 * @returns Random string
 */
export const generateRandomString = (length = 10): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}

/**
 * Debounces a function call
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait = 300,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Throttles a function call
 * @param func Function to throttle
 * @param limit Limit time in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit = 300,
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Extracts query parameters from a URL
 * @param url URL with query parameters
 * @returns Object with query parameters
 */
export const getQueryParams = (url: string): Record<string, string> => {
  if (!url || !url.includes("?")) return {}

  const params: Record<string, string> = {}
  const queryString = url.split("?")[1]
  const pairs = queryString.split("&")

  for (const pair of pairs) {
    const [key, value] = pair.split("=")
    params[decodeURIComponent(key)] = decodeURIComponent(value || "")
  }

  return params
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param value Value to check
 * @returns Boolean indicating if value is empty
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === "string" && value.trim() === "") return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === "object" && Object.keys(value).length === 0) return true
  return false
}

/**
 * Safely parses JSON without throwing an exception
 * @param json JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    return fallback
  }
}

/**
 * Gets initials from a name
 * @param name Full name
 * @param maxLength Maximum number of initials (default: 2)
 * @returns Initials string
 */
export const getInitials = (name: string, maxLength = 2): string => {
  if (!name) return ""
  
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, maxLength)
    .join("")
    .toUpperCase()
}

/**
 * Converts hex color to rgba
 * @param hex Hex color code
 * @param alpha Alpha value (0-1)
 * @returns RGBA color string
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  if (!hex) return `rgba(0, 0, 0, ${alpha})`
  
  // Remove # if present
  hex = hex.replace("#", "")
  
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("")
  }
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Generates a lighter or darker variant of a color
 * @param hex Hex color code
 * @param percent Percentage to lighten (positive) or darken (negative)
 * @returns Modified hex color
 */
export const shadeColor = (hex: string, percent: number): string => {
  if (!hex) return "#000000"
  
  // Remove # if present
  hex = hex.replace("#", "")
  
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("")
  }
  
  // Parse hex values
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)
  
  // Adjust color
  r = Math.min(255, Math.max(0, Math.round(r + (percent / 100) * 255)))
  g = Math.min(255, Math.max(0, Math.round(g + (percent / 100) * 255)))
  b = Math.min(255, Math.max(0, Math.round(b + (percent / 100) * 255)))
  
  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Pluralizes a word based on count
 * @param count Count
 * @param singular Singular form
 * @param plural Plural form (default: singular + 's')
 * @returns Appropriate form based on count
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
  return count === 1 ? singular : plural || `${singular}s`
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes"
  
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Extracts domain from a URL
 * @param url URL
 * @returns Domain name
 */
export const extractDomain = (url: string): string => {
  if (!url) return ""
  
  try {
    const domain = new URL(url).hostname
    return domain
  } catch (error) {
    return ""
  }
}

/**
 * Masks a string (e.g., for credit card numbers)
 * @param str String to mask
 * @param visibleChars Number of visible characters at the end
 * @param maskChar Mask character (default: '*')
 * @returns Masked string
 */
export const maskString = (str: string, visibleChars = 4, maskChar = "*"): string => {
  if (!str) return ""
  
  const visiblePart = str.slice(-visibleChars)
  const maskedPart = maskChar.repeat(str.length - visibleChars)
  
  return maskedPart + visiblePart
}

/**
 * Checks if a value is a valid URL
 * @param url URL to validate
 * @returns Boolean indicating if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Checks if a value is a valid phone number
 * @param phone Phone number to validate
 * @returns Boolean indicating if phone number is valid
 */
export const isValidPhone = (phone: string): boolean => {
  // Basic phone validation - adjust regex as needed for your requirements
  const phoneRegex = /^\+?[0-9]{10,15}$/
  return phoneRegex.test(phone.replace(/[\s()-]/g, ""))
}

/**
 * Generates a random color
 * @param alpha Alpha value (0-1)
 * @returns Random color in rgba format
 */
export const randomColor = (alpha: number = 1): string => {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Checks if two objects are equal
 * @param obj1 First object
 * @param obj2 Second object
 * @returns Boolean indicating if objects are equal
 */
export const areObjectsEqual = (obj1: any, obj2: any): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

/**
 * Removes duplicate items from an array
 * @param array Array with potential duplicates
 * @param key Optional key for objects
 * @returns Array with duplicates removed
 */
export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!array) return []
  
  if (key) {
    const seen = new Set()
    return array.filter((item) => {
      const value = item[key]
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  }
  
  return [...new Set(array)]
}

/**
 * Sorts an array of objects by a key
 * @param array Array to sort
 * @param key Key to sort by
 * @param direction Sort direction ('asc' or 'desc')
 * @returns Sorted array
 */
export const sortArrayByKey = <T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] => {
  if (!array) return []
  
  return [...array].sort((a, b) => {
    const valueA = a[key]
    const valueB = b[key]
    
    if (valueA < valueB) return direction === "asc" ? -1 : 1
    if (valueA > valueB) return direction === "asc" ? 1 : -1
    return 0
  })
}

/**
 * Groups an array of objects by a key
 * @param array Array to group
 * @param key Key to group by
 * @returns Object with groups
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  if (!array) return {}
  
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    result[groupKey] = result[groupKey] || []
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Delays execution for a specified time
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retries a function multiple times
 * @param fn Function to retry
 * @param maxAttempts Maximum number of attempts
 * @param delay Delay between attempts in milliseconds
 * @returns Promise with the function result
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt < maxAttempts) {
        await sleep(delay)
      }
    }
  }
  
  throw lastError
}

/**
 * Converts a string to kebab-case
 * @param str String to convert
 * @returns Kebab-case string
 */
export const toKebabCase = (str: string): string => {
  if (!str) return ""
  
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
}

/**
 * Converts a string to camelCase
 * @param str String to convert
 * @returns CamelCase string
 */
export const toCamelCase = (str: string): string => {
  if (!str) return ""
  
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, "")
}

/**
 * Converts a string to snake_case
 * @param str String to convert
 * @returns Snake_case string
 */
export const toSnakeCase = (str: string): string => {
  if (!str) return ""
  
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase()
}

/**
 * Gets a random item from an array
 * @param array Array to get item from
 * @returns Random item
 */
export const getRandomItem = <T>(array: T[]): T | undefined => {
  if (!array || array.length === 0) return undefined
  
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

/**
 * Shuffles an array
 * @param array Array to shuffle
 * @returns Shuffled array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  if (!array) return []
  
  const result = [...array]
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  
  return result
}

/**
 * Checks if a value is a valid JSON string
 * @param str String to check
 * @returns Boolean indicating if string is valid JSON
 */
export const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Converts a value to a boolean
 * @param value Value to convert
 * @returns Boolean value
 */
export const toBoolean = (value: any): boolean => {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const lowercased = value.toLowerCase()
    return lowercased === "true" || lowercased === "yes" || lowercased === "1"
  }
  if (typeof value === "number") return value === 1
  return Boolean(value)
}

/**
 * Formats a phone number
 * @param phone Phone number to format
 * @param format Format (default: '(XXX) XXX-XXXX')
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string, format = "(XXX) XXX-XXXX"): string => {
  if (!phone) return ""
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "")
  
  // Apply format
  let result = format
  for (let i = 0; i < cleaned.length; i++) {
    result = result.replace("X", cleaned[i])
  }
  
  // Remove any remaining X placeholders
  result = result.replace(/X/g, "")
  
  return result
}

/**
 * Generates a UUID v4
 * @returns UUID string
 */
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Checks if a date is today
 * @param date Date to check
 * @returns Boolean indicating if date is today
 */
export const isToday = (date: Date | string | number): boolean => {
  const today = new Date()
  const checkDate = new Date(date)
  
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  )
}

/**
 * Checks if a date is yesterday
 * @param date Date to check
 * @returns Boolean indicating if date is yesterday
 */
export const isYesterday = (date: Date | string | number): boolean => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  const checkDate = new Date(date)
  
  return (
    checkDate.getDate() === yesterday.getDate() &&
    checkDate.getMonth() === yesterday.getMonth() &&
    checkDate.getFullYear() === yesterday.getFullYear()
  )
}

/**
 * Gets the current location
 * @returns Promise with location coordinates
 */
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      }
    )
  })
}

/**
 * Calculates distance between two coordinates in kilometers
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

/**
 * Converts degrees to radians
 * @param deg Degrees
 * @returns Radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180)
}

/**
 * Checks if the app is running in development mode
 * @returns Boolean indicating if app is in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === "development"
}

/**
 * Checks if the app is running in production mode
 * @returns Boolean indicating if app is in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === "production"
}

/**
 * Checks if the app is running in test mode
 * @returns Boolean indicating if app is in test mode
 */
export const isTest = (): boolean => {
  return process.env.NODE_ENV === "test"
}

/**
 * Checks if the app is running on web
 * @returns Boolean indicating if app is running on web
 */
export const isWeb = (): boolean => {
  return Platform.OS === "web"
}

/**
 * Checks if the app is running on a mobile device
 * @returns Boolean indicating if app is running on mobile
 */
export const isMobile = (): boolean => {
  return Platform.OS === "ios" || Platform.OS === "android"
}

/**
 * Gets the platform name
 * @returns Platform name
 */
export const getPlatform = (): string => {
  return Platform.OS
}

/**
 * Gets the platform version
 * @returns Platform version
 */
export const getPlatformVersion = (): string => {
  return Platform.Version.toString()
}

/**
 * Checks if the device is in landscape orientation
 * @returns Boolean indicating if device is in landscape orientation
 */
export const isLandscape = (): boolean => {
  return deviceWidth > deviceHeight
}

/**
 * Checks if the device is in portrait orientation
 * @returns Boolean indicating if device is in portrait orientation
 */
export const isPortrait = (): boolean => {
  return deviceHeight > deviceWidth
}

/**
 * Gets the device type (phone, tablet, desktop)
 * @returns Device type
 */
export const getDeviceType = (): "phone" | "tablet" | "desktop" => {
  if (Platform.OS === "web") return "desktop"
  if (deviceWidth >= 768) return "tablet"
  return "phone"
}

/**
 * Checks if the device is a tablet
 * @returns Boolean indicating if device is a tablet
 */
export const isTablet = (): boolean => {
  return getDeviceType() === "tablet"
}

/**
 * Checks if the device is a phone
 * @returns Boolean indicating if device is a phone
 */
export const isPhone = (): boolean => {
  return getDeviceType() === "phone"
}

/**
 * Checks if the device is a desktop
 * @returns Boolean indicating if device is a desktop
 */
export const isDesktop = (): boolean => {
  return getDeviceType() === "desktop"
}

/**
 * Gets the device dimensions
 * @returns Object with device width and height
 */
export const getDeviceDimensions = (): { width: number; height: number } => {
  return { width: deviceWidth, height: deviceHeight }
}

/**
 * Gets the device aspect ratio
 * @returns Device aspect ratio
 */
export const getAspectRatio = (): number => {
  return deviceWidth / deviceHeight
}

/**
 * Gets the device pixel ratio
 * @returns Device pixel ratio
 */
export const getPixelRatio = (): number => {
  return Platform.OS === "web" ? 1 : Dimensions.get("window").scale
}

/**
 * Gets the device font scale
 * @returns Device font scale
 */
export const getFontScale = (): number => {
  return Platform.OS === "web" ? 1 : Dimensions.get("window").fontScale
}

/**
 * Checks if the device has a notch
 * @returns Boolean indicating if device has a notch
 */
export const hasNotch = (): boolean => {
  // This is a simplified check - for a more accurate check, use a library like react-native-device-info
  return (
    Platform.OS === "ios" &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (deviceHeight === 812 || deviceWidth === 812 || deviceHeight === 896 || deviceWidth === 896)
  )
}

/**
 * Gets the safe area insets
 * @returns Object with safe area insets
 */
export const getSafeAreaInsets = (): { top: number; right: number; bottom: number; left: number } => {
  // This is a simplified version - for accurate values, use react-native-safe-area-context
  if (Platform.OS === "ios" && hasNotch()) {
    return { top: 44, right: 0, bottom: 34, left: 0 }
  }
  return { top: 0, right: 0, bottom: 0, left: 0 }
}

/**
 * Checks if a feature is available on the current platform
 * @param feature Feature to check
 * @returns Boolean indicating if feature is available
 */
export const isFeatureAvailable = (feature: "camera" | "biometrics" | "nfc" | "bluetooth"): boolean => {
  // This is a simplified check - for accurate checks, use device capability libraries
  if (Platform.OS === "web") {
    return feature === "camera" // Only camera might be available on web
  }
  return true // Assume available on mobile platforms
}

/**
 * Formats bytes to a human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes"
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

/**
 * Converts a string to title case
 * @param str String to convert
 * @returns Title case string
 */
export const toTitleCase = (str: string): string => {
  if (!str) return ""
  
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

/**
 * Checks if a string contains only alphanumeric characters
 * @param str String to check
 * @returns Boolean indicating if string is alphanumeric
 */
export const isAlphanumeric = (str: string): boolean => {
  if (!str) return false
  
  return /^[a-zA-Z0-9]+$/.test(str)
}

/**
 * Checks if a string contains only alphabetic characters
 * @param str String to check
 * @returns Boolean indicating if string is alphabetic
 */
export const isAlphabetic = (str: string): boolean => {
  if (!str) return false
  
  return /^[a-zA-Z]+$/.test(str)
}

/**
 * Checks if a string contains only numeric characters
 * @param str String to check
 * @returns Boolean indicating if string is numeric
 */
export const isNumeric = (str: string): boolean => {
  if (!str) return false
  
  return /^[0-9]+$/.test(str)
}

/**
 * Converts a string to a URL-friendly slug
 * @param str String to convert
 * @returns URL-friendly slug
 */
export const slugify = (str: string): string => {
  if (!str) return ""
  
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random integer
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Checks if an object has a property
 * @param obj Object to check
 * @param prop Property to check for
 * @returns Boolean indicating if object has property
 */
export const hasProperty = (obj: any, prop: string): boolean => {
  if (!obj) return false
  
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

/**
 * Gets a nested property from an object using a path
 * @param obj Object to get property from
 * @param path Path to property (e.g., 'user.address.city')
 * @param defaultValue Default value if property doesn't exist
 * @returns Property value or default value
 */
export const getNestedProperty = (obj: any, path: string, defaultValue: any = undefined): any => {
  if (!obj || !path) return defaultValue
  
  const keys = path.split(".")
  let result = obj
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== "object") {
      return defaultValue
    }
    result = result[key]
  }
  
  return result === undefined ? defaultValue : result
}

/**
 * Converts an array to chunks of specified size
 * @param array Array to chunk
 * @param size Chunk size
 * @returns Array of chunks
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  if (!array || !array.length) return []
  
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  
  return chunks
}

/**
 * Flattens a nested array
 * @param array Nested array
 * @returns Flattened array
 */
export const flattenArray = <T>(array: any[]): T[] => {
  if (!array) return []
  
  return array.reduce((result, item) => {
    if (Array.isArray(item)) {
      return [...result, ...flattenArray(item)]
    }
    return [...result, item]
  }, [])
}

/**
 * Checks if all items in an array satisfy a condition
 * @param array Array to check
 * @param predicate Condition function
 * @returns Boolean indicating if all items satisfy condition
 */
export const allItemsSatisfy = <T>(array: T[], predicate: (item: T) => boolean): boolean => {
  if (!array || !array.length) return false
  
  return array.every(predicate)
}

/**
 * Checks if any item in an array satisfies a condition
 * @param array Array to check
 * @param predicate Condition function
 * @returns Boolean indicating if any item satisfies condition
 */
export const anyItemSatisfies = <T>(array: T[], predicate: (item: T) => boolean): boolean => {
  if (!array || !array.length) return false
  
  return array.some(predicate)
}

/**
 * Counts items in an array that satisfy a condition
 * @param array Array to check
 * @param predicate Condition function
 * @returns Count of items that satisfy condition
 */
export const countItemsSatisfying = <T>(array: T[], predicate: (item: T) => boolean): number => {
  if (!array) return 0
  
  return array.filter(predicate).length
}

/**
 * Creates a deep copy of an object
 * @param obj Object to copy
 * @returns Deep copy of object
 */
export const deepCopy = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj
  
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Merges two objects deeply
 * @param target Target object
 * @param source Source object
 * @returns Merged object
 */
export const deepMerge = (target: any, source: any): any => {
  if (!source) return target
  if (!target) return source
  
  const result = { ...target }
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      result[key] = deepMerge(target[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  
  return result
}

/**
 * Picks specified properties from an object
 * @param obj Object to pick from
 * @param keys Keys to pick
 * @returns New object with picked properties
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  if (!obj) return {} as Pick<T, K>
  
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
    return result
  }, {} as Pick<T, K>)
}

/**
 * Omits specified properties from an object
 * @param obj Object to omit from
 * @param keys Keys to omit
 * @returns New object without omitted properties
 */
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  if (!obj) return {} as Omit<T, K>
  
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  
  return result as Omit<T, K>
}

/**
 * Checks if an object is empty
 * @param obj Object to check
 * @returns Boolean indicating if object is empty
 */
export const isEmptyObject = (obj: any): boolean => {
  if (!obj) return true
  
  return Object.keys(obj).length === 0
}

/**
 * Checks if an array is empty
 * @param array Array to check
 * @returns Boolean indicating if array is empty
 */
export const isEmptyArray = (array: any[]): boolean => {
  if (!array) return true
  
  return array.length === 0
}

/**
 * Checks if a string is empty
 * @param str String to check
 * @returns Boolean indicating if string is empty
 */
export const isEmptyString = (str: string): boolean => {
  if (str === null || str === undefined) return true
  
  return str.trim() === ""
}

/**
 * Checks if a value is null or undefined
 * @param value Value to check
 * @returns Boolean indicating if value is null or undefined
 */
export const isNullOrUndefined = (value: any): boolean => {
  return value === null || value === undefined
}

/**
 * Checks if a value is defined (not null or undefined)
 * @param value Value to check
 * @returns Boolean indicating if value is defined
 */
export const isDefined = (value: any): boolean => {
  return !isNullOrUndefined(value)
}

/**
 * Gets a value or a default if the value is null or undefined
 * @param value Value to check
 * @param defaultValue Default value
 * @returns Value or default
 */
export const getValueOrDefault = <T>(value: T | null | undefined, defaultValue: T): T => {
  return isNullOrUndefined(value) ? defaultValue : (value as T)
}

/**
 * Converts a value to a number or returns a default if conversion fails
 * @param value Value to convert
 * @param defaultValue Default value
 * @returns Converted number or default
 */
export const toNumber = (value: any, defaultValue = 0): number => {
  if (isNullOrUndefined(value)) return defaultValue
  
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

/**
 * Converts a value to a string
 * @param value Value to convert
 * @returns String representation of value
 */
export const toString = (value: any): string => {
  if (isNullOrUndefined(value)) return ""
  
  return String(value)
}

/**
 * Converts a value to an integer
 * @param value Value to convert
 * @param defaultValue Default value
 * @returns Integer or default
 */
export const toInteger = (value: any, defaultValue = 0): number => {
  if (isNullOrUndefined(value)) return defaultValue
  
  const num = parseInt(value, 10)
  return isNaN(num) ? defaultValue : num
}

/**
 * Converts a value to a float
 * @param value Value to convert
 * @param defaultValue Default value
 * @returns Float or default
 */
export const toFloat = (value: any, defaultValue = 0): number => {
  if (isNullOrUndefined(value)) return defaultValue
  
  const num = parseFloat(value)
  return isNaN(num) ? defaultValue : num
}

/**
 * Clamps a number between min and max
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Checks if a value is between min and max (inclusive)
 * @param value Value to check
 * @param min Minimum value
 * @param max Maximum value
 * @returns Boolean indicating if value is between min and max
 */
export const isBetween = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * Rounds a number to a specified number of decimal places
 * @param value Value to round
 * @param decimals Number of decimal places
 * @returns Rounded value
 */
export const roundTo = (value: number, decimals = 0): number => {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Formats a number with commas as thousands separators
 * @param value Value to format
 * @returns Formatted value
 */
export const formatWithCommas = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Formats a number as a percentage
 * @param value Value to format
 * @param decimals Number of decimal places
 * @returns Formatted percentage
 */
export const formatAsPercentage = (value: number, decimals = 0): string => {
  return `${roundTo(value * 100, decimals)}%`
}

/**
 * Calculates the percentage of a value relative to a total
 * @param value Value
 * @param total Total
 * @returns Percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Generates a range of numbers
 * @param start Start value
 * @param end End value
 * @param step Step value
 * @returns Array of numbers
 */
export const range = (start: number, end: number, step = 1): number[] => {
  const result: number[] = []
  for (let i = start; i <= end; i += step) {
    result.push(i)
  }
  return result
}

/**
 * Sums an array of numbers
 * @param array Array of numbers
 * @returns Sum
 */
export const sum = (array: number[]): number => {
  if (!array || !array.length) return 0
  return array.reduce((total, num) => total + num, 0)
}

/**
 * Calculates the average of an array of numbers
 * @param array Array of numbers
 * @returns Average
 */
export const average = (array: number[]): number => {
  if (!array || !array.length) return 0
  return sum(array) / array.length
}

/**
 * Finds the minimum value in an array of numbers
 * @param array Array of numbers
 * @returns Minimum value
 */
export const min = (array: number[]): number => {
  if (!array || !array.length) return 0
  return Math.min(...array)
}

/**
 * Finds the maximum value in an array of numbers
 * @param array Array of numbers
 * @returns Maximum value
 */
export const max = (array: number[]): number => {
  if (!array || !array.length) return 0
  return Math.max(...array)
}

/**
 * Calculates the median of an array of numbers
 * @param array Array of numbers
 * @returns Median
 */
export const median = (array: number[]): number => {
  if (!array || !array.length) return 0
  
  const sorted = [...array].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  
  return sorted[middle]
}

/**
 * Calculates the mode of an array of numbers
 * @param array Array of numbers
 * @returns Mode
 */
export const mode = (array: number[]): number[] => {
  if (!array || !array.length) return []
  
  const counts = array.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1
    return acc
  }, {} as Record<number, number>)
  
  const maxCount = Math.max(...Object.values(counts))
  
  return Object.keys(counts)
    .filter((key) => counts[Number(key)] === maxCount)
    .map(Number)
}

/**
 * Calculates the standard deviation of an array of numbers
 * @param array Array of numbers
 * @returns Standard deviation
 */
export const standardDeviation = (array: number[]): number => {
  if (!array || array.length <= 1) return 0
  
  const avg = average(array)
  const squareDiffs = array.map((value) => Math.pow(value - avg, 2))
  const variance = sum(squareDiffs) / (array.length - 1)
  
  return Math.sqrt(variance)
}

/**
 * Normalizes an array of numbers to a range of 0 to 1
 * @param array Array of numbers
 * @returns Normalized array
 */
export const normalize = (array: number[]): number => {
  if (!array || !array.length) return []
  
  const minVal = min(array)
  const maxVal = max(array)
  
  if (minVal === maxVal) return array.map(() => 0.5)
  
  return array.map((val) => (val - minVal) / (maxVal - minVal))
}

/**
 * Scales an array of numbers to a specified range
 * @param array Array of numbers
 * @param newMin New minimum value
 * @param newMax New maximum value
 * @returns Scaled array
 */
export const scale = (array: number[], newMin: number, newMax: number): number[] => {
  if (!array || !array.length) return []
  
  const normalized = normalize(array)
  return normalized.map((val) => val * (newMax - newMin) + newMin)
}

/**
 * Checks if a value is a prime number
 * @param num Number to check
 * @returns Boolean indicating if number is prime
 */
export const isPrime = (num: number): boolean => {
  if (num <= 1) return false
  if (num <= 3) return true
  if (num % 2 === 0 || num % 3 === 0) return false
  
  let i = 5
  while (i * i <= num) {
    if (num % i === 0 || num % (i + 2) === 0) return false
    i += 6
  }
  
  return true
}

/**
 * Calculates the factorial of a number
 * @param num Number
 * @returns Factorial
 */
export const factorial = (num: number): number => {
  if (num < 0) return NaN
  if (num <= 1) return 1
  
  let result = 1
  for (let i = 2; i <= num; i++) {
    result *= i
  }
  
  return result
}

/**
 * Calculates the greatest common divisor of two numbers
 * @param a First number
 * @param b Second number
 * @returns Greatest common divisor
 */
export const gcd = (a: number, b: number): number => {
  a = Math.abs(a)
  b = Math.abs(b)
  
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  
  return a
}

/**
 * Calculates the least common multiple of two numbers
 * @param a First number
 * @param b Second number
 * @returns Least common multiple
 */
export const lcm = (a: number, b: number): number => {
  return Math.abs(a * b) / gcd(a, b)
}

/**
 * Checks if a number is even
 * @param num Number to check
 * @returns Boolean indicating if number is even
 */
export const isEven = (num: number): boolean => {
  return num % 2 === 0
}

/**
 * Checks if a number is odd
 * @param num Number to check
 * @returns Boolean indicating if number is odd
 */
export const isOdd = (num: number): boolean => {
  return num % 2 !== 0
}

/**
 * Checks if a number is an integer
 * @param num Number to check
 * @returns Boolean indicating if number is an integer
 */
export const isInteger = (num: number): boolean => {
  return Number.isInteger(num)
}

/**
 * Checks if a number is a float
 * @param num Number to check
 * @returns Boolean indicating if number is a float
 */
export const isFloat = (num: number): boolean => {
  return Number.isFinite(num) && !Number.isInteger(num)
}

/**
 * Checks if a number is positive
 * @param num Number to check
 * @returns Boolean indicating if number is positive
 */
export const isPositive = (num: number): boolean => {
  return num > 0
}

/**
 * Checks if a number is negative
 * @param num Number to check
 * @returns Boolean indicating if number is negative
 */
export const isNegative = (num: number): boolean => {
  return num < 0
}

/**
 * Checks if a number is zero
 * @param num Number to check
 * @returns Boolean indicating if number is zero
 */
export const isZero = (num: number): boolean => {
  return num === 0
}

/**
 * Converts a number to its ordinal form
 * @param num Number to convert
 * @returns Ordinal form
 */
export const toOrdinal = (num: number): string => {
  const j = num % 10
  const k = num % 100
  
  if (j === 1 && k !== 11) {
    return `${num}st`
  }
  if (j === 2 && k !== 12) {
    return `${num}nd`
  }
  if (j === 3 && k !== 13) {
    return `${num}rd`
  }
  
  return `${num}th`
}

/**
 * Converts a number to words
 * @param num Number to convert
 * @returns Number in words
 */
export const numberToWords = (num: number): string => {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
  
  const numToWords = (n: number): string => {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + ones[n % 10] : "")
    if (n < 1000) return ones[Math.floor(n / 100)] + " hundred" + (n % 100 !== 0 ? " and " + numToWords(n % 100) : "")
    if (n < 1000000) return numToWords(Math.floor(n / 1000)) + " thousand" + (n % 1000 !== 0 ? " " + numToWords(n % 1000) : "")
    return numToWords(Math.floor(n / 1000000)) + " million" + (n % 1000000 !== 0 ? " " + numToWords(n % 1000000) : "")
  }
  
  if (num === 0) return "zero"
  if (num < 0) return "negative " + numberToWords(-num)
  
  return numToWords(num)
}

/**
 * Converts a string to a URL-friendly slug
 * @param str String to convert
 * @returns URL-friendly slug
 */
export const toSlug = (str: string): string => {
  if (!str) return ""
  
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param str String to truncate
 * @param length Maximum length
 * @param ellipsis Ellipsis string
 * @returns Truncated string
 */
export const truncate = (str: string, length = 100, ellipsis = "..."): string => {
  if (!str) return ""
  if (str.length <= length) return str
  
  return str.substring(0, length - ellipsis.length) + ellipsis
}

/**
 * Escapes HTML special characters in a string
 * @param str String to escape
 * @returns Escaped string
 */
export const escapeHtml = (str: string): string => {
  if (!str) return ""
  
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Unescapes HTML special characters in a string
 * @param str String to unescape
 * @returns Unescaped string
 */
export const unescapeHtml = (str: string): string => {
  if (!str) return ""
  
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

/**
 * Pads a string to a specified length
 * @param str String to pad
 * @param length Target length
 * @param char Padding character
 * @returns Padded string
 */
export const padString = (str: string, length: number, char = " "): string => {
  if (!str) return char.repeat(length)
  
  const padLength = Math.max(0, length - str.length)
  return str + char.repeat(padLength)
}

/**
 * Pads a string on the left to a specified length
 * @param str String to pad
 * @param length Target length
 * @param char Padding character
 * @returns Padded string
 */
export const padLeft = (str: string, length: number, char = " "): string => {
  if (!str) return char.repeat(length)
  
  const padLength = Math.max(0, length - str.length)
  return char.repeat(padLength) + str
}

/**
 * Pads a string on the right to a specified length
 * @param str String to pad
 * @param length Target length
 * @param char Padding character
 * @returns Padded string
 */
export const padRight = (str: string, length: number, char = " "): string => {
  if (!str) return char.repeat(length)
  
  const padLength = Math.max(0, length - str.length)
  return str + char.repeat(padLength)
}

/**
 * Reverses a string
 * @param str String to reverse
 * @returns Reversed string
 */
export const reverseString = (str: string): string => {
  if (!str) return ""
  
  return str.split("").reverse().join("")
}

/**
 * Counts occurrences of a substring in a string
 * @param str String to search in
 * @param substring Substring to search for
 * @returns Number of occurrences
 */
export const countOccurrences = (str: string, substring: string): number => {
  if (!str || !substring) return 0
  
  let count = 0
  let pos = str.indexOf(substring)
  
  while (pos !== -1) {
    count++
    pos = str.indexOf(substring, pos + 1)
  }
  
  return count
}

/**
 * Checks if a string is a palindrome
 * @param str String to check
 * @returns Boolean indicating if string is a palindrome
 */
export const isPalindrome = (str: string): boolean => {
  if (!str) return false
  
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "")
  return cleaned === reverseString(cleaned)
}

/**
 * Generates a random string
 * @param length Length of string
 * @param chars Characters to use
 * @returns Random string
 */
export const randomString = (
  length = 10,
  chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
): string => {
  let result = ""
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Generates a random alphanumeric string
 * @param length Length of string
 * @returns Random alphanumeric string
 */
export const randomAlphanumeric = (length = 10): string => {
  return randomString(length, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")
}

/**
 * Generates a random alphabetic string
 * @param length Length of string
 * @returns Random alphabetic string
 */
export const randomAlphabetic = (length = 10): string => {
  return randomString(length, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
}

/**
 * Generates a random numeric string
 * @param length Length of string
 * @returns Random numeric string
 */
export const randomNumeric = (length = 10): string => {
  return randomString(length, "0123456789")
}

/**
 * Generates a random hexadecimal string
 * @param length Length of string
 * @returns Random hexadecimal string
 */
export const randomHex = (length = 10): string => {
  return randomString(length, "0123456789ABCDEF")
}

/**
 * Generates a random color in hex format
 * @returns Random color
 */
export const randomHexColor = (): string => {
  return `#${randomHex(6)}`
}

/**
 * Generates a random boolean
 * @returns Random boolean
 */
export const randomBoolean = (): boolean => {
  return Math.random() >= 0.5
}

/**
 * Generates a random date between two dates
 * @param start Start date
 * @param end End date
 * @returns Random date
 */
export const randomDate = (start = new Date(2000, 0, 1), end = new Date()): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/**
 * Generates a random element from an array
 * @param array Array to pick from
 * @returns Random element
 */
export const randomElement = <T>(array: T[]): T | undefined => {
  if (!array || !array.length) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generates a random subset of an array
 * @param array Array to pick from
 * @param count Number of elements to pick
 * @returns Random subset
 */
export const randomSubset = <T>(array: T[], count: number): T[] => {
  if (!array || !array.length || count <= 0) return []
  if (count >= array.length) return [...array]
  
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * Generates a random IP address
 * @returns Random IP address
 */
export const randomIpAddress = (): string => {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
}

/**
 * Generates a random email address
 * @returns Random email address
 */
export const randomEmail = (): string => {
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "example.com"]
  return `${randomAlphanumeric(8)}@${randomElement(domains)}`
}

/**
 * Generates a random username
 * @returns Random username
 */
export const randomUsername = (): string => {
  return `user_${randomAlphanumeric(8)}`
}

/**
 * Generates a random password
 * @param length Length of password
 * @returns Random password
 */
export const randomPassword = (length = 12): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+"
  return randomString(length, chars)
}

/**
 * Generates a random phone number
 * @returns Random phone number
 */
export const randomPhoneNumber = (): string => {
  return `+1${randomNumeric(10)}`
}

/**
 * Generates a random URL
 * @returns Random URL
 */
export const randomUrl = (): string => {
  const domains = ["example.com", "test.org", "demo.net", "sample.io", "mock.dev"]
  return `https://www.${randomElement(domains)}/${randomAlphanumeric(8)}`
}

/**
 * Generates a random avatar URL
 * @returns Random avatar URL
 */
export const randomAvatar = (): string => {
  return `https://i.pravatar.cc/150?u=${randomString(8)}`
}

/**
 * Generates a random image URL
 * @param width Image width
 * @param height Image height
 * @returns Random image URL
 */
export const randomImage = (width = 400, height = 300): string => {
  return `https://picsum.photos/${width}/${height}?random=${randomString(8)}`
}

/**
 * Generates a random file name
 * @param extension File extension
 * @returns Random file name
 */
export const randomFileName = (extension = "txt"): string => {
  return `file_${randomAlphanumeric(8)}.${extension}`
}

/**
 * Generates a random sentence
 * @param wordCount Number of words
 * @returns Random sentence
 */
export const randomSentence = (wordCount = 10): string => {
  const words = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "a", "an", "and", "but", "or", "for", "nor", "on", "at", "to", "from", "by", "with", "in", "out", "up", "down", "is", "are", "was", "were", "be", "being", "been", "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should", "may", "might", "must", "can", "could"]
  
  let sentence = ""
  for (let i = 0; i < wordCount; i++) {
    sentence += randomElement(words) + " "
  }
  
  sentence = sentence.trim()
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + "."
}

/**
 * Generates a random paragraph
 * @param sentenceCount Number of sentences
 * @returns Random paragraph
 */
export const randomParagraph = (sentenceCount = 5): string => {
  let paragraph = ""
  for (let i = 0; i < sentenceCount; i++) {
    paragraph += randomSentence(randomInt(5, 15)) + " "
  }
  
  return paragraph.trim()
}

/**
 * Generates a random lorem ipsum text
 * @param paragraphCount Number of paragraphs
 * @returns Random lorem ipsum text
 */
export const randomLoremIpsum = (paragraphCount = 3): string => {
  const loremIpsum = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.",
    "Donec euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.",
    "Sed euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.",
    "Fusce euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.",
    "Vivamus euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.",
    "Curabitur euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.",
    "Pellentesque euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.",
    "Etiam euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.",
    "Vestibulum euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.",
  ]
  
  let result = ""
  for (let i = 0; i < paragraphCount; i++) {
    result += randomSubset(loremIpsum, randomInt(3, 6)).join(" ") + "\n\n"
  }
  
  return result.trim()
}

export default {
  capitalize,
  wp,
  hp,
  stripHtmlTags,
  formatDate,
  formatTimeAgo,
  truncateText,
  formatCurrency,
  formatNumber,
  isValidEmail,
  isStrongPassword,
  isIOS,
  isAndroid,
  generateRandomString,
  debounce,
  throttle,
  getQueryParams,
  isEmpty,
  safeJsonParse,
  getInitials,
  hexToRgba,
  shadeColor,
  pluralize,
  formatFileSize,
  extractDomain,
  maskString,
  isValidUrl,
  isValidPhone,
  randomColor,
  areObjectsEqual,
  removeDuplicates,
  sortArrayByKey,
  groupBy,
  sleep,
  retry,
  toKebabCase,
  toCamelCase,
  toSnakeCase,
  getRandomItem,
  shuffleArray,
  isValidJson,
  toBoolean,
  formatPhoneNumber,
  generateUUID,
  isToday,
  isYesterday,
  getCurrentLocation,
  calculateDistance,
  isDevelopment,
  isProduction,
  isTest,
  isWeb,
  isMobile,
  getPlatform,
  getPlatformVersion,
  isLandscape,
  isPortrait,
  getDeviceType,
  isTablet,
  isPhone,
  isDesktop,
  getDeviceDimensions,
  getAspectRatio,
  getPixelRatio,
  getFontScale,
  hasNotch,
  getSafeAreaInsets,
  isFeatureAvailable,
  formatBytes,
  toTitleCase,
  isAlphanumeric,
  isAlphabetic,
  isNumeric,
  slugify,
  randomInt,
  hasProperty,
  getNestedProperty,
  chunkArray,
  flattenArray,
  allItemsSatisfy,
  anyItemSatisfies,
  countItemsSatisfying,
  deepCopy,
  deepMerge,
  pick,
  omit,
  isEmptyObject,
  isEmptyArray,
  isEmptyString,
  isNullOrUndefined,
  isDefined,
  getValueOrDefault,
  toNumber,
  toString,
  toInteger,
  toFloat,
  clamp,
  isBetween,
  roundTo,
  formatWithCommas,
  formatAsPercentage,
  calculatePercentage,
  range,
  sum,
  average,
  min,
  max,
  median,
  mode,
  standardDeviation,
  normalize,
  scale,
  isPrime,
  factorial,
  gcd,
  lcm,
  isEven,
  isOdd,
  isInteger,
  isFloat,
  isPositive,
  isNegative,
  isZero,
  toOrdinal,
  numberToWords,
  toSlug,
  truncate,
  escapeHtml,
  unescapeHtml,
  padString,
  padLeft,
  padRight,
  reverseString,
  countOccurrences,
  isPalindrome,
  randomString,
  randomAlphanumeric,
  randomAlphabetic,
  randomNumeric,
  randomHex,
  randomHexColor,
  randomBoolean,
  randomDate,
  randomElement,
  randomSubset,
  randomIpAddress,
  randomEmail,
  randomUsername,
  randomPassword,
  randomPhoneNumber,
  randomUrl,
  randomAvatar,
  randomImage,
  randomFileName,
  randomSentence,
  randomParagraph,
  randomLoremIpsum,
}
