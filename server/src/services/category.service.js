import prisma from '../utils/prisma.js';

export async function createCategory(data) {
  const category = await prisma.category.create({
    data,
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
    },
  });
  return category;
}

export async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: true } },
    },
  });
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  return category;
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });

  // Build tree structure
  const buildTree = (cats, parentId = null) =>
    cats
      .filter((c) => (c.parentId || null) === parentId)
      .map((c) => ({
        ...c,
        children: buildTree(cats, c.id),
      }));

  return buildTree(categories);
}

export async function updateCategory(id, data) {
  const category = await prisma.category.update({
    where: { id },
    data,
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
    },
  });
  return category;
}

export async function deleteCategory(id) {
  await prisma.category.delete({ where: { id } });
  return { message: 'Category deleted' };
}
