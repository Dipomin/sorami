// Service S3 simplifié utilisant le modèle BookFormat
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from './prisma'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

// Uploader un fichier de livre vers S3
export async function uploadBookFormat(
  bookId: string,
  format: 'PDF' | 'EPUB' | 'MOBI' | 'DOCX' | 'HTML' | 'TXT' | 'MARKDOWN',
  content: Buffer,
  filename: string
) {
  try {
    const key = `books/${bookId}/${format.toLowerCase()}/${Date.now()}-${filename}`
    
    // Upload vers S3
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: content,
      ContentType: getContentType(format)
    }))
    
    // Enregistrer en base de données
    const bookFormat = await prisma.bookFormat.create({
      data: {
        bookId,
        format: format as any,
        fileName: filename,
        fileSize: content.length,
        mimeType: getContentType(format),
        storageProvider: 'AWS_S3',
        s3Bucket: BUCKET_NAME,
        s3Key: key,
        status: 'READY'
      }
    })
    
    return bookFormat
  } catch (error) {
    console.error('Erreur upload S3:', error)
    throw error
  }
}

// Générer une URL de téléchargement
export async function getBookFormatDownloadUrl(formatId: string): Promise<string> {
  try {
    const bookFormat = await prisma.bookFormat.findUnique({
      where: { id: formatId }
    })
    
    if (!bookFormat || !bookFormat.s3Key) {
      throw new Error('Format non trouvé')
    }
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: bookFormat.s3Key
    })
    
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  } catch (error) {
    console.error('Erreur génération URL:', error)
    throw error
  }
}

// Convertir un livre vers différents formats
export async function convertBookToFormats(bookId: string) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          orderBy: { order: 'asc' }
        }
      }
    })
    
    if (!book) {
      throw new Error('Livre non trouvé')
    }
    
    // Générer le contenu HTML
    const htmlContent = generateHTML(book)
    const htmlBuffer = Buffer.from(htmlContent, 'utf8')
    
    // Uploader le format HTML
    const htmlFormat = await uploadBookFormat(
      bookId,
      'HTML',
      htmlBuffer,
      `${book.title}.html`
    )
    
    // Générer le contenu TXT
    const txtContent = generateTXT(book)
    const txtBuffer = Buffer.from(txtContent, 'utf8')
    
    // Uploader le format TXT
    const txtFormat = await uploadBookFormat(
      bookId,
      'TXT',
      txtBuffer,
      `${book.title}.txt`
    )
    
    return {
      html: htmlFormat,
      txt: txtFormat
    }
  } catch (error) {
    console.error('Erreur conversion formats:', error)
    throw error
  }
}

// Utilitaires
function getContentType(format: string): string {
  const types: Record<string, string> = {
    'PDF': 'application/pdf',
    'EPUB': 'application/epub+zip',
    'MOBI': 'application/x-mobipocket-ebook',
    'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'HTML': 'text/html',
    'TXT': 'text/plain',
    'MARKDOWN': 'text/markdown'
  }
  return types[format] || 'application/octet-stream'
}

function generateHTML(book: any): string {
  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${book.title}</title>
    <style>
        body { font-family: Georgia, serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; }
        h2 { color: #555; margin-top: 30px; }
    </style>
</head>
<body>
    <h1>${book.title}</h1>`
  
  if (book.subtitle) html += `<h2>${book.subtitle}</h2>`
  if (book.description) html += `<p><em>${book.description}</em></p>`
  
  book.chapters.forEach((chapter: any) => {
    html += `<h2>${chapter.title}</h2>`
    if (chapter.description) html += `<p><em>${chapter.description}</em></p>`
    html += `<div>${chapter.content}</div>`
  })
  
  html += '</body></html>'
  return html
}

function generateTXT(book: any): string {
  let content = `${book.title}\n${'='.repeat(book.title.length)}\n\n`
  
  if (book.subtitle) content += `${book.subtitle}\n\n`
  if (book.description) content += `${book.description}\n\n`
  
  book.chapters.forEach((chapter: any) => {
    content += `\n${chapter.title}\n${'-'.repeat(chapter.title.length)}\n\n`
    if (chapter.description) content += `${chapter.description}\n\n`
    content += `${chapter.content}\n\n`
  })
  
  return content
}