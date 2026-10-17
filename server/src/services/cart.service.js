import prisma from '../utils/prisma.js';

// ─── Get or Create Active Cart ──────────────────────────────────────
export async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              supplier: { select: { companyName: true, country: true } },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, status: 'ACTIVE' },
      include: { items: true }, // empty on creation
    });
  }

  return cart;
}

// ─── Add Item to Cart ───────────────────────────────────────────────
export async function addToCart(userId, productId, quantity) {
  const cart = await getOrCreateCart(userId);
  
  // Check if item already exists
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    // Update quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  return getOrCreateCart(userId);
}

// ─── Remove Item from Cart ──────────────────────────────────────────
export async function removeFromCart(userId, cartItemId) {
  const cart = await getOrCreateCart(userId);

  // Verify the item belongs to this user's cart
  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cartId: cart.id },
  });

  if (!item) {
    const err = new Error('Item not found in cart');
    err.status = 404;
    throw err;
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  return getOrCreateCart(userId);
}
