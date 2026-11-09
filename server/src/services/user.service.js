import prisma from '../utils/prisma.js';

export async function listUsers(query) {
  const { page = 1, limit = 20, role, search, isVerified } = query;

  const where = {};

  if (role) where.role = role;
  if (isVerified !== undefined) where.isVerified = isVerified === 'true';
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      { contactName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        companyName: true,
        contactName: true,
        phone: true,
        country: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            inquiriesSent: true,
            inquiriesReceived: true,
            ordersAsBuyer: true,
            ordersAsSupplier: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      companyName: true,
      contactName: true,
      phone: true,
      country: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      products: {
        select: { id: true, title: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      inquiries: {
        select: { id: true, message: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      ordersAsBuyer: {
        select: { id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      ordersAsSupplier: {
        select: { id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return user;
}

export async function verifyUser(id) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (user.role !== 'SUPPLIER') {
    const err = new Error('Only supplier accounts can be verified');
    err.status = 400;
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isVerified: true },
    select: {
      id: true,
      email: true,
      role: true,
      companyName: true,
      isVerified: true,
    },
  });

  return updated;
}

export async function unverifyUser(id) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isVerified: false },
    select: {
      id: true,
      email: true,
      role: true,
      companyName: true,
      isVerified: true,
    },
  });

  return updated;
}

export async function updateUserRole(id, newRole) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: newRole },
    select: {
      id: true,
      email: true,
      role: true,
      companyName: true,
      isVerified: true,
    },
  });

  return updated;
}

export async function deleteUser(id) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (user.role === 'ADMIN') {
    const err = new Error('Cannot delete admin accounts');
    err.status = 400;
    throw err;
  }

  await prisma.user.delete({ where: { id } });
  return { message: 'User deleted' };
}

export async function getPublicSupplierProfile(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      companyName: true,
      companySlug: true,
      contactName: true,
      country: true,
      city: true,
      businessType: true,
      description: true,
      logoUrl: true,
      bannerUrl: true,
      yearEstablished: true,
      website: true,
      isVerified: true,
      rating: true,
      reviewCount: true,
      responseRate: true,
      responseTimeHours: true,
      totalTransactions: true,
      createdAt: true,
      _count: {
        select: { products: true },
      },
    },
  });

  if (!user) {
    const err = new Error('Supplier not found');
    err.status = 404;
    throw err;
  }

  if (user.role !== 'SUPPLIER' && user.role !== 'ADMIN') {
    const err = new Error('This user is not a supplier');
    err.status = 400;
    throw err;
  }

  return user;
}
