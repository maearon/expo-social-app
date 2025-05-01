import * as FileSystem from "expo-file-system"
import * as ImageManipulator from "expo-image-manipulator"
import { Platform } from "react-native"

/**
 * Media Service
 * Provides utilities for handling media files
 */
const mediaService = {
  /**
   * Compress an image file
   * @param uri Image URI
   * @param quality Compression quality (0-1)
   * @param maxWidth Maximum width
   * @param maxHeight Maximum height
   * @returns Promise with compressed image URI
   */
  async compressImage(uri: string, quality = 0.7, maxWidth = 1200, maxHeight = 1200): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: maxWidth, height: maxHeight } }], {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      })
      return result.uri
    } catch (error) {
      console.error("Error compressing image:", error)
      return uri // Return original if compression fails
    }
  },

  /**
   * Get file info from URI
   * @param uri File URI
   * @returns Object with file info
   */
  getFileInfo(uri: string): { name: string; type: string; uri: string } {
    const uriParts = uri.split("/")
    const name = uriParts[uriParts.length - 1]
    const nameParts = name.split(".")
    const type =
      nameParts.length > 1 ? `${this.getMimeType(nameParts[nameParts.length - 1])}` : "application/octet-stream"

    // On Android, file URIs need to be prefixed with file:// for FormData
    const fileUri = Platform.OS === "android" && !uri.startsWith("file://") ? `file://${uri}` : uri

    return { name, type, uri: fileUri }
  },

  /**
   * Get MIME type from file extension
   * @param extension File extension
   * @returns MIME type string
   */
  getMimeType(extension: string): string {
    const ext = extension.toLowerCase()
    const mimeTypes: { [key: string]: string } = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }

    return mimeTypes[ext] || "application/octet-stream"
  },

  /**
   * Create a FormData object for file upload
   * @param uri File URI
   * @param fieldName Form field name
   * @param mimeType Optional MIME type
   * @returns FormData object
   */
  createFormData(uri: string, fieldName: string, mimeType?: string): FormData {
    const fileInfo = this.getFileInfo(uri)
    const formData = new FormData()

    formData.append(fieldName, {
      uri: fileInfo.uri,
      name: fileInfo.name,
      type: mimeType || fileInfo.type,
    } as any)

    return formData
  },

  /**
   * Download a file to local storage
   * @param uri Remote file URI
   * @param filename Optional filename
   * @returns Promise with local file URI
   */
  async downloadFile(uri: string, filename?: string): Promise<string> {
    try {
      const fileUri = `${FileSystem.cacheDirectory}${filename || Date.now()}`
      const result = await FileSystem.downloadAsync(uri, fileUri)
      return result.uri
    } catch (error) {
      console.error("Error downloading file:", error)
      throw error
    }
  },
}

export default mediaService
