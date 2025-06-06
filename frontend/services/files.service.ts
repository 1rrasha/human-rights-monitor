const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface FileResponse {
  url: string
  type: string
  date_captured: string
  description: string | null
}

export const getFileUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`
}

export const getFileType = (url: string): string => {

  const extension = url.split('.').pop()?.toLowerCase()

  
  if (!extension) return 'unknown'
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  const videoExtensions = ['mp4', 'webm', 'mov']
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt']
  
  let fileType = 'unknown'
  if (imageExtensions.includes(extension)) fileType = 'image'
  if (videoExtensions.includes(extension)) fileType = 'video'
  if (documentExtensions.includes(extension)) fileType = 'document'
  

  return fileType
}

export const isImageFile = (url: string): boolean => {
  return getFileType(url) === 'image'
}

export const isVideoFile = (url: string): boolean => {
  return getFileType(url) === 'video'
}

export const isDocumentFile = (url: string): boolean => {
  return getFileType(url) === 'document'
} 