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

// ─── Checkout Cart → Orders ─────────────────────────────────────────
export async function checkoutCart(userId) {
  const cart = await prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    const err = new Error('Cart is empty');
    err.status = 400;
    throw err;
  }

  // Generate order number helper
  const genOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  // Create orders and clear cart in a single transaction
  const orders = await prisma.$transaction(async (tx) => {
    const created = [];

    for (const item of cart.items) {
      const p = item.product;

      // Guard: enough stock
      if (p.stockQty < item.quantity) {
        const err = new Error(`Not enough stock for ${p.title}. Available: ${p.stockQty}`);
        err.status = 400;
        throw err;
      }

      // Guard: meets MOQ
      if (item.quantity < p.minOrderQty) {
        const err = new Error(
          `Quantity ${item.quantity} is below MOQ ${p.minOrderQty} for ${p.title}`
        );
        err.status = 400;
        throw err;
      }

      const order = await tx.order.create({
        data: {
          orderNumber: genOrderNumber(),
          buyerId: userId,
          supplierId: p.supplierId,
          productId: p.id,
          quantity: item.quantity,
          unitPrice: p.priceMin,
          totalAmount: item.quantity * p.priceMin,
          currency: p.currency,
          status: 'PENDING',
        },
      });

      // Decrement stock
      await tx.product.update({
        where: { id: p.id },
        data: { stockQty: { decrement: item.quantity } },
      });

      created.push(order);
    }

    // Clear the cart items
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Mark cart as CHECKED_OUT
    await tx.cart.update({
      where: { id: cart.id },
      data: { status: 'CHECKED_OUT' },
    });

    return created;
  });

  return { orders };
}
