import prisma from '../utils/prisma.js';

export async function getDashboardStats() {
  const [
    totalUsers,
    totalSuppliers,
    totalBuyers,
    totalProducts,
    totalOrders,
    totalInquiries,
    totalMessages,
    pendingProducts,
    pendingInquiries,
    recentOrders,
    topSuppliers,
    topProducts,
    ordersByStatus,
    usersByRole,
    monthlyOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'SUPPLIER' } }),
    prisma.user.count({ where: { role: 'BUYER' } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.inquiry.count(),
    prisma.message.count(),
    prisma.product.count({ where: { status: 'PENDING' } }),
    prisma.inquiry.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        buyer: { select: { id: true, companyName: true } },
        supplier: { select: { id: true, companyName: true } },
        product: { select: { id: true, title: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: 'SUPPLIER' },
      select: {
        id: true,
        companyName: true,
        country: true,
        isVerified: true,
        _count: { select: { products: true, ordersAsSupplier: true } },
      },
      orderBy: { ordersAsSupplier: { _count: 'desc' } },
      take: 5,
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        images: true,
        priceMin: true,
        priceMax: true,
        unit: true,
        _count: { select: { inquiries: true, orders: true } },
      },
      orderBy: { inquiries: { _count: 'desc' } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 11)),
        },
      },
      select: { createdAt: true },
    }),
  ]);

  // Calculate monthly order counts
  const monthlyCounts = {};
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyCounts[key] = 0;
  }
  monthlyOrders.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in monthlyCounts) monthlyCounts[key]++;
  });

  return {
    overview: {
      totalUsers,
      totalSuppliers,
      totalBuyers,
      totalProducts,
      totalOrders,
      totalInquiries,
      totalMessages,
      pendingProducts,
      pendingInquiries,
    },
    recentOrders,
    topSuppliers,
    topProducts,
    ordersByStatus: ordersByStatus.reduce((acc, s) => {
      acc[s.status] = s._count.status;
      return acc;
    }, {}),
    usersByRole: usersByRole.reduce((acc, r) => {
      acc[r.role] = r._count.role;
      return acc;
    }, {}),
    monthlyOrders: Object.entries(monthlyCounts).map(([month, count]) => ({
      month,
      count,
    })),
  };
}

export async function getSupplierAnalytics(supplierId) {
  const [
    totalProducts,
    activeProducts,
    totalInquiries,
    pendingInquiries,
    totalOrders,
    completedOrders,
    totalRevenue,
    recentInquiries,
    recentOrders,
    productsByStatus,
  ] = await Promise.all([
    prisma.product.count({ where: { supplierId } }),
    prisma.product.count({ where: { supplierId, status: 'ACTIVE' } }),
    prisma.inquiry.count({ where: { supplierId } }),
    prisma.inquiry.count({ where: { supplierId, status: 'PENDING' } }),
    prisma.order.count({ where: { supplierId } }),
    prisma.order.count({ where: { supplierId, status: 'DELIVERED' } }),
    prisma.order.aggregate({
      where: { supplierId, status: { in: ['DELIVERED', 'SHIPPED'] } },
      _sum: { totalAmount: true },
    }),
    prisma.inquiry.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        buyer: { select: { id: true, companyName: true, country: true } },
        product: { select: { id: true, title: true } },
      },
    }),
    prisma.order.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        buyer: { select: { id: true, companyName: true } },
        product: { select: { id: true, title: true } },
      },
    }),
    prisma.product.groupBy({
      by: ['status'],
      where: { supplierId },
      _count: { status: true },
    }),
  ]);

  return {
    overview: {
      totalProducts,
      activeProducts,
      totalInquiries,
      pendingInquiries,
      totalOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    },
    recentInquiries,
    recentOrders,
    productsByStatus: productsByStatus.reduce((acc, s) => {
      acc[s.status] = s._count.status;
      return acc;
    }, {}),
  };
}

export async function getBuyerAnalytics(buyerId) {
  const [
    totalInquiries,
    pendingInquiries,
    totalOrders,
    completedOrders,
    totalSpent,
    recentInquiries,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    prisma.inquiry.count({ where: { buyerId } }),
    prisma.inquiry.count({ where: { buyerId, status: 'PENDING' } }),
    prisma.order.count({ where: { buyerId } }),
    prisma.order.count({ where: { buyerId, status: 'DELIVERED' } }),
    prisma.order.aggregate({
      where: { buyerId, status: { in: ['DELIVERED', 'SHIPPED'] } },
      _sum: { totalAmount: true },
    }),
    prisma.inquiry.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        product: { select: { id: true, title: true } },
        supplier: { select: { id: true, companyName: true } },
      },
    }),
    prisma.order.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        supplier: { select: { id: true, companyName: true } },
        product: { select: { id: true, title: true } },
      },
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: { buyerId },
      _count: { status: true },
    }),
  ]);

  return {
    overview: {
      totalInquiries,
      pendingInquiries,
      totalOrders,
      completedOrders,
      totalSpent: totalSpent._sum.totalAmount || 0,
    },
    recentInquiries,
    recentOrders,
    ordersByStatus: ordersByStatus.reduce((acc, s) => {
      acc[s.status] = s._count.status;
      return acc;
    }, {}),
  };
}
