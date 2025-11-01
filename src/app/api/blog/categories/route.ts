/**
 * API Route: Blog Categories
 * Gestion CRUD des catégories de blog
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-admin';
import slugify from 'slugify';

/**
 * GET /api/blog/categories
 * Liste toutes les catégories
 * Public
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('includeCount') === 'true';

    let categories;

    if (includeCount) {
      // Inclure le nombre d'articles par catégorie
      categories = await prisma.blogCategory.findMany({
        orderBy: { name: 'asc' },
      });

      // Compter les articles publiés pour chaque catégorie
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const count = await prisma.blogPost.count({
            where: {
              category: category.slug,
              published: true,
            },
          });
          return { ...category, postsCount: count };
        })
      );

      return NextResponse.json(categoriesWithCount);
    } else {
      // Simple liste
      categories = await prisma.blogCategory.findMany({
        orderBy: { name: 'asc' },
      });

      return NextResponse.json(categories);
    }
  } catch (error: any) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog categories', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/categories
 * Créer une nouvelle catégorie (Admin uniquement)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    const body = await request.json();
    const { name, description, icon, color } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Générer le slug
    let slug = slugify(name, { lower: true, strict: true });

    // Vérifier l'unicité du slug
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    // Créer la catégorie
    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        color: color || '#6366f1', // Default indigo
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog category:', error);
    
    if (error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create blog category', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blog/categories
 * Mettre à jour une catégorie (Admin uniquement)
 */
export async function PUT(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    const body = await request.json();
    const { id, name, description, icon, color } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name;
      
      // Regénérer le slug si le nom change
      if (name !== existingCategory.name) {
        let newSlug = slugify(name, { lower: true, strict: true });
        
        // Vérifier l'unicité (sauf pour la catégorie actuelle)
        const slugExists = await prisma.blogCategory.findFirst({
          where: {
            slug: newSlug,
            id: { not: id },
          },
        });

        if (slugExists) {
          return NextResponse.json(
            { error: 'A category with this name already exists' },
            { status: 409 }
          );
        }

        updateData.slug = newSlug;
      }
    }

    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;

    // Mettre à jour la catégorie
    const category = await prisma.blogCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating blog category:', error);
    
    if (error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update blog category', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/categories
 * Supprimer une catégorie (Admin uniquement)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des articles dans cette catégorie
    const postsCount = await prisma.blogPost.count({
      where: { category: existingCategory.slug },
    });

    if (postsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${postsCount} posts are using it` },
        { status: 409 }
      );
    }

    // Supprimer la catégorie
    await prisma.blogCategory.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting blog category:', error);
    
    if (error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete blog category', details: error.message },
      { status: 500 }
    );
  }
}
