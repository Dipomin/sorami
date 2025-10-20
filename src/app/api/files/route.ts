// API Route pour la gestion des fichiers de livres avec S3
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadBookFile, getBookFiles, getBookFile, getDownloadUrl } from '@/lib/s3-storage'

// Upload d'un fichier de livre
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bookId = formData.get('bookId') as string
    const organizationId = formData.get('organizationId') as string
    const format = formData.get('format') as string
    
    if (!file || !bookId || !organizationId || !format) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }
    
    // Convertir le fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Uploader vers S3 et enregistrer en base
    const uploadResult = await uploadBookFile({
      bookId,
      format: format as any,
      content: buffer,
      filename: file.name,
      metadata: {
        originalSize: file.size,
        uploadedBy: 'user' // TODO: récupérer l'utilisateur actuel
      }
    })
    
    return NextResponse.json({
      success: true,
      file: uploadResult
    })
  } catch (error) {
    console.error('Erreur upload fichier:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
}

// Récupérer les fichiers d'un livre
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')
    const action = searchParams.get('action')
    const fileId = searchParams.get('fileId')
    
    if (!bookId) {
      return NextResponse.json(
        { error: 'bookId requis' },
        { status: 400 }
      )
    }
    
    // Action de téléchargement d'un fichier spécifique
    if (action === 'download' && fileId) {
      const downloadInfo = await getBookFile(fileId)
      return NextResponse.json(downloadInfo)
    }
    
    // Lister tous les fichiers du livre
    const files = await getBookFiles(bookId)
    return NextResponse.json({ files })
  } catch (error) {
    console.error('Erreur récupération fichiers:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// Convertir un livre vers un nouveau format
export async function PUT(request: NextRequest) {
  try {
    const { bookId, targetFormat } = await request.json()
    
    if (!bookId || !targetFormat) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }
    
    // Conversion du livre
        // Fonction de conversion non implémentée pour le moment
    return NextResponse.json({ 
      error: 'Conversion de format non implémentée' 
    }, { status: 501 })

    // return NextResponse.json({
    //   message: 'Livre converti avec succès',
    //   format: targetFormat,
    //   file: 'converted file info here'
    // })
    
    // return NextResponse.json({
    //   success: true,
    //   file: 'converted file info'
    // })
  } catch (error) {
    console.error('Erreur conversion:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la conversion' },
      { status: 500 }
    )
  }
}