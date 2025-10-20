// Système de stockage S3 pour les livres - Version simplifiée
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from './prisma'

// Configuration S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'sorami-storage'

// Types
export interface BookFileUpload {
  bookId: string
  content: string | Buffer
  format: 'PDF' | 'EPUB' | 'DOCX' | 'MOBI'
  filename?: string
  metadata?: Record<string, any>
}

export interface BookFileInfo {
  id: string
  path: string
  size: number
  format: string
  downloadUrl: string
}

// ============================================================================
// FONCTIONS PRINCIPALES
// ============================================================================

export async function uploadBookFile(uploadData: BookFileUpload): Promise<BookFileInfo> {
  try {
    const { bookId, content, format, filename, metadata } = uploadData
    
    // Générer la clé S3
    const timestamp = Date.now()
    const extension = format.toLowerCase()
    const key = `books/${bookId}/${timestamp}.${extension}`
    
    // Upload vers S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: content,
      ContentType: getContentType(format),
      Metadata: {
        bookId,
        format,
        uploadedAt: new Date().toISOString(),
        ...(metadata || {})
      }
    })
    
    await s3Client.send(command)
    
    // Calculer la taille
    const fileSize = typeof content === 'string' 
      ? Buffer.byteLength(content, 'utf8')
      : content.byteLength
    
    // Enregistrer en base de données
    const bookFormat = await prisma.bookFormat.create({
      data: {
        bookId,
        format: format as any,
        fileName: filename || `book.${extension}`,
        fileSize,
        mimeType: getContentType(format),
        storageProvider: 'S3' as any,
        s3Bucket: BUCKET_NAME,
        s3Key: key,
        filePath: key,
        status: 'READY' as any
      }
    })
    
    return {
      id: bookFormat.id,
      path: key,
      size: fileSize,
      format: format,
      downloadUrl: await getDownloadUrl(key)
    }
  } catch (error) {
    console.error('Erreur upload fichier S3:', error)
    throw new Error('Impossible d\'uploader le fichier')
  }
}

export async function getBookFile(fileId: string): Promise<BookFileInfo | null> {
  try {
    const bookFormat = await prisma.bookFormat.findUnique({
      where: { id: fileId }
    })
    
    if (!bookFormat || !bookFormat.s3Key) {
      return null
    }
    
    return {
      id: bookFormat.id,
      path: bookFormat.s3Key,
      size: bookFormat.fileSize,
      format: bookFormat.format,
      downloadUrl: await getDownloadUrl(bookFormat.s3Key)
    }
  } catch (error) {
    console.error('Erreur récupération fichier:', error)
    return null
  }
}

export async function getBookFiles(bookId: string): Promise<BookFileInfo[]> {
  try {
    const bookFormats = await prisma.bookFormat.findMany({
      where: { bookId }
    })
    
    return Promise.all(
      bookFormats.map(async (format) => ({
        id: format.id,
        path: format.s3Key || '',
        size: format.fileSize,
        format: format.format,
        downloadUrl: format.s3Key ? await getDownloadUrl(format.s3Key) : ''
      }))
    )
  } catch (error) {
    console.error('Erreur récupération fichiers livre:', error)
    return []
  }
}

export async function deleteBookFile(fileId: string): Promise<boolean> {
  try {
    const bookFormat = await prisma.bookFormat.findUnique({
      where: { id: fileId }
    })
    
    if (!bookFormat || !bookFormat.s3Key) {
      return false
    }
    
    // Supprimer de S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: bookFormat.s3Key
    })
    
    await s3Client.send(deleteCommand)
    
    // Supprimer de la base de données
    await prisma.bookFormat.delete({
      where: { id: fileId }
    })
    
    return true
  } catch (error) {
    console.error('Erreur suppression fichier:', error)
    return false
  }
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

export async function getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })
    
    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
    console.error('Erreur génération URL de téléchargement:', error)
    return ''
  }
}

function getContentType(format: string): string {
  switch (format.toUpperCase()) {
    case 'PDF':
      return 'application/pdf'
    case 'EPUB':
      return 'application/epub+zip'
    case 'DOCX':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'MOBI':
      return 'application/x-mobipocket-ebook'
    default:
      return 'application/octet-stream'
  }
}

// ============================================================================
// MÉTRIQUES ET MONITORING
// ============================================================================

export async function recordStorageUsage(organizationId: string | null, bytes: number): Promise<void> {
  try {
    if (!organizationId) return
    
    await prisma.usageMetric.create({
      data: {
        organizationId,
        userId: '',  // Sera rempli plus tard avec l'authentification
        metric: 'STORAGE' as any,
        value: bytes,
        unit: 'bytes',
        periodStart: new Date(),
        periodEnd: new Date()
      }
    })
  } catch (error) {
    console.error('Erreur enregistrement métrique stockage:', error)
    // Ne pas faire échouer l'upload pour une erreur de métrique
  }
}

export async function getStorageUsage(organizationId: string): Promise<{ totalBytes: number, fileCount: number }> {
  try {
    const usage = await prisma.bookFormat.aggregate({
      where: { 
        book: { organizationId }
      },
      _sum: {
        fileSize: true
      },
      _count: {
        id: true
      }
    })
    
    return {
      totalBytes: usage._sum.fileSize || 0,
      fileCount: usage._count.id || 0
    }
  } catch (error) {
    console.error('Erreur calcul usage stockage:', error)
    return { totalBytes: 0, fileCount: 0 }
  }
}