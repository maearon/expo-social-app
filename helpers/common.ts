import { Dimensions } from "react-native"

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

export default {
  capitalize,
  wp,
  hp,
  stripHtmlTags,
}
