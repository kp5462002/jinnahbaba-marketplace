import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Apparel & Accessories', slug: 'apparel-accessories' },
  { name: 'Consumer Electronics', slug: 'consumer-electronics' },
  { name: 'Sports & Entertainment', slug: 'sports-entertainment' },
  { name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
  { name: 'Industrial Machinery', slug: 'industrial-machinery' },
  { name: 'Home & Garden', slug: 'home-garden' },
  { name: 'Jewelry & Watches', slug: 'jewelry-watches' },
  { name: 'Automotive & Motorcycle', slug: 'automotive-motorcycle' },
  { name: 'Packaging & Printing', slug: 'packaging-printing' },
  { name: 'Medical Supplies', slug: 'medical-supplies' },
];

const SUPPLIERS = [
  { email: 'supplier1@jinnahbaba.com', companyName: 'Karachi Textiles Co.', companySlug: 'karachi-textiles-co', contactName: 'Ahmed Khan', country: 'Pakistan', city: 'Karachi', businessType: 'MANUFACTURER', yearEstablished: 2008, description: 'Leading manufacturer of premium quality textiles and apparel. Exporting to 30+ countries since 2008.', isVerified: true, responseRate: 96, responseTimeHours: 2, rating: 4.7, reviewCount: 342, totalTransactions: 1250, phone: '+92-300-1234567' },
  { email: 'supplier2@jinnahbaba.com', companyName: 'Shenzhen ElectroTech Ltd.', companySlug: 'shenzhen-electrotech', contactName: 'Li Wei', country: 'China', city: 'Shenzhen', businessType: 'MANUFACTURER', yearEstablished: 2012, description: 'Consumer electronics and smart home devices manufacturer. OEM/ODM welcome.', isVerified: true, responseRate: 98, responseTimeHours: 1, rating: 4.8, reviewCount: 512, totalTransactions: 2100, phone: '+86-755-12345678' },
  { email: 'supplier3@jinnahbaba.com', companyName: 'Sialkot Sports Goods', companySlug: 'sialkot-sports-goods', contactName: 'Muhammad Asif', country: 'Pakistan', city: 'Sialkot', businessType: 'MANUFACTURER', yearEstablished: 2005, description: 'Premium sports goods and leather products. FIFA certified manufacturer.', isVerified: true, responseRate: 94, responseTimeHours: 3, rating: 4.6, reviewCount: 289, totalTransactions: 890, phone: '+92-52-9876543' },
  { email: 'supplier4@jinnahbaba.com', companyName: 'Istanbul Home Decor', companySlug: 'istanbul-home-decor', contactName: 'Mehmet Yilmaz', country: 'Turkey', city: 'Istanbul', businessType: 'TRADING_COMPANY', yearEstablished: 2015, description: 'Modern home decor, kitchenware, and garden supplies.', isVerified: true, responseRate: 92, responseTimeHours: 4, rating: 4.5, reviewCount: 178, totalTransactions: 620, phone: '+90-212-5551234' },
  { email: 'supplier5@jinnahbaba.com', companyName: 'Mumbai Auto Parts', companySlug: 'mumbai-auto-parts', contactName: 'Rajesh Patel', country: 'India', city: 'Mumbai', businessType: 'DISTRIBUTOR', yearEstablished: 2010, description: 'Automotive spare parts and motorcycle accessories distributor.', isVerified: false, responseRate: 88, responseTimeHours: 6, rating: 4.3, reviewCount: 96, totalTransactions: 340, phone: '+91-22-66667777' },
];

const PRODUCTS = [
  { title: 'Premium Leather Gloves for Men', cat: 'apparel-accessories', supplier: 0, priceMin: 8.50, priceMax: 13.00, minOrderQty: 100, unit: 'pair', shortDesc: 'Genuine sheep leather, winter warm, custom logo available', tags: ['leather', 'gloves', 'men', 'winter'], images: ['https://images.unsplash.com/photo-1610384104075-e05c8cf200c3?w=800'], isFeatured: true },
  { title: 'Custom Logo Cotton T-Shirts Bulk', cat: 'apparel-accessories', supplier: 0, priceMin: 2.20, priceMax: 3.80, minOrderQty: 500, unit: 'piece', shortDesc: '100% cotton, 180gsm, screen printing, OEM welcome', tags: ['tshirt', 'cotton', 'custom', 'bulk'], images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'] },
  { title: 'Magnetic Levitation LED Night Lamp', cat: 'consumer-electronics', supplier: 1, priceMin: 12.00, priceMax: 18.50, minOrderQty: 50, unit: 'piece', shortDesc: 'Floating levitating moon lamp, wireless charging, 3 color temps', tags: ['lamp', 'levitation', 'led', 'smart home'], images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800'], isFeatured: true },
  { title: 'Wireless Bluetooth Earbuds TWS', cat: 'consumer-electronics', supplier: 1, priceMin: 4.50, priceMax: 9.80, minOrderQty: 100, unit: 'piece', shortDesc: 'BT 5.3, touch control, 30h battery, with charging case', tags: ['earbuds', 'bluetooth', 'tws', 'audio'], images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'], isFeatured: true },
  { title: 'Smart Watch Fitness Tracker', cat: 'consumer-electronics', supplier: 1, priceMin: 8.90, priceMax: 15.00, minOrderQty: 100, unit: 'piece', shortDesc: 'Heart rate, SpO2, IP68 waterproof', tags: ['smartwatch', 'fitness', 'tracker'], images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'] },
  { title: 'Professional Football Size 5 FIFA', cat: 'sports-entertainment', supplier: 2, priceMin: 6.80, priceMax: 11.50, minOrderQty: 200, unit: 'piece', shortDesc: 'Hand-stitched, PU leather, FIFA quality approved', tags: ['football', 'soccer', 'fifa', 'sports'], images: ['https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800'], isFeatured: true },
  { title: 'Boxing Gloves Genuine Leather Pro', cat: 'sports-entertainment', supplier: 2, priceMin: 14.00, priceMax: 22.00, minOrderQty: 50, unit: 'pair', shortDesc: 'Cowhide leather, gel padding, professional training', tags: ['boxing', 'gloves', 'leather', 'training'], images: ['https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800'] },
  { title: 'Organic Face Serum Vitamin C', cat: 'beauty-personal-care', supplier: 3, priceMin: 3.80, priceMax: 6.50, minOrderQty: 100, unit: 'piece', shortDesc: '30ml glass bottle, private label, 20% vitamin C', tags: ['serum', 'skincare', 'vitamin c', 'organic'], images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'] },
  { title: 'Natural Argan Oil Hair Treatment', cat: 'beauty-personal-care', supplier: 3, priceMin: 4.20, priceMax: 7.90, minOrderQty: 200, unit: 'bottle', shortDesc: '100ml Moroccan argan oil, cold pressed', tags: ['argan', 'hair', 'oil', 'moroccan'], images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800'] },
  { title: 'CNC Router Machine 3-Axis', cat: 'industrial-machinery', supplier: 1, priceMin: 1850.00, priceMax: 2400.00, minOrderQty: 1, unit: 'unit', shortDesc: 'Woodworking CNC, 1.5kW spindle', tags: ['cnc', 'router', 'woodworking', 'machine'], images: ['https://jinnahbaba.com/product-images/cnc-router.jpg'] },
  { title: 'Ceramic Dinnerware Set 16-Piece', cat: 'home-garden', supplier: 3, priceMin: 22.00, priceMax: 34.00, minOrderQty: 50, unit: 'set', shortDesc: 'Porcelain, modern design, dishwasher safe', tags: ['dinnerware', 'ceramic', 'kitchen', 'set'], images: ['https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800'] },
  { title: 'Garden Tool Set Stainless Steel', cat: 'home-garden', supplier: 3, priceMin: 12.50, priceMax: 19.00, minOrderQty: 100, unit: 'set', shortDesc: '10-piece set, ergonomic handles', tags: ['garden', 'tools', 'stainless'], images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'] },
  { title: '925 Sterling Silver Necklace', cat: 'jewelry-watches', supplier: 3, priceMin: 8.50, priceMax: 15.00, minOrderQty: 50, unit: 'piece', shortDesc: 'Fine silver, personalized pendant', tags: ['silver', 'necklace', 'jewelry'], images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'], isFeatured: true },
  { title: 'Motorcycle LED Headlight H4 6000K', cat: 'automotive-motorcycle', supplier: 4, priceMin: 5.80, priceMax: 10.50, minOrderQty: 100, unit: 'piece', shortDesc: 'Super bright, waterproof', tags: ['motorcycle', 'led', 'headlight'], images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'] },
  { title: 'Car Phone Holder Magnetic Universal', cat: 'automotive-motorcycle', supplier: 4, priceMin: 2.10, priceMax: 3.80, minOrderQty: 200, unit: 'piece', shortDesc: '360 rotation, strong magnet', tags: ['car', 'phone holder', 'magnetic'], images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800'] },
  { title: 'Custom Kraft Paper Boxes Eco-Friendly', cat: 'packaging-printing', supplier: 0, priceMin: 0.35, priceMax: 0.90, minOrderQty: 1000, unit: 'piece', shortDesc: 'Recyclable, custom printed', tags: ['boxes', 'kraft', 'eco', 'packaging'], images: ['https://images.unsplash.com/photo-1607083206325-caf1edba7a0f?w=800'] },
  { title: 'Disposable 3-Ply Face Masks CE', cat: 'medical-supplies', supplier: 4, priceMin: 0.02, priceMax: 0.05, minOrderQty: 10000, unit: 'piece', shortDesc: 'CE certified, 3-layer protection', tags: ['mask', 'medical', 'disposable', 'ce'], images: ['https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800'] },
  { title: 'Digital Infrared Thermometer', cat: 'medical-supplies', supplier: 4, priceMin: 4.50, priceMax: 8.90, minOrderQty: 100, unit: 'piece', shortDesc: 'Non-contact, fast reading', tags: ['thermometer', 'infrared', 'medical'], images: ['https://images.unsplash.com/photo-1584515933487-779824d29309?w=800'] },
  { title: 'Stainless Steel Water Bottle 500ml', cat: 'home-garden', supplier: 3, priceMin: 2.80, priceMax: 4.50, minOrderQty: 500, unit: 'piece', shortDesc: 'Vacuum insulated, custom logo', tags: ['bottle', 'water', 'stainless'], images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'] },
  { title: 'Electric Coffee Grinder Stainless', cat: 'home-garden', supplier: 1, priceMin: 9.50, priceMax: 14.00, minOrderQty: 100, unit: 'piece', shortDesc: '200W motor, removable bowl', tags: ['coffee', 'grinder', 'kitchen'], images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'] },
];

function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🌱 Starting seed...');
  console.log('🧹 Clearing existing data...');
  await prisma.message.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.rFQResponse.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Creating admin...');
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.create({ data: { email: 'admin@jinnahbaba.com', passwordHash, role: 'ADMIN', contactName: 'Admin', isVerified: true } });

  console.log('🛒 Creating buyers...');
  const buyers = [];
  for (let i = 1; i <= 3; i++) {
    buyers.push(await prisma.user.create({ data: { email: `buyer${i}@jinnahbaba.com`, passwordHash, role: 'BUYER', contactName: `Buyer ${i}`, companyName: `Buyer Company ${i}`, country: 'Pakistan', city: 'Lahore', phone: `+92-300-000000${i}`, isVerified: true } }));
  }

  console.log('🏭 Creating suppliers...');
  const suppliers = [];
  for (const s of SUPPLIERS) {
    suppliers.push(await prisma.user.create({ data: { ...s, passwordHash, role: 'SUPPLIER', logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.companyName)}&background=16a34a&color=fff&size=200` } }));
  }

  console.log('📂 Creating categories...');
  const categories = [];
  for (const c of CATEGORIES) { categories.push(await prisma.category.create({ data: c })); }

  console.log('📦 Creating products...');
  for (const p of PRODUCTS) {
    const supplier = suppliers[p.supplier];
    const category = categories.find((c) => c.slug === p.cat);
    if (!category) continue;
    const slug = slugify(p.title) + '-' + Math.random().toString(36).slice(2, 6);
    const product = await prisma.product.create({
      data: {
        supplierId: supplier.id, categoryId: category.id, title: p.title, slug,
        description: `${p.shortDesc}\n\nThis product is manufactured to the highest industry standards.`,
        shortDesc: p.shortDesc, priceMin: p.priceMin, priceMax: p.priceMax,
        minOrderQty: p.minOrderQty, unit: p.unit, currency: 'USD',
        stockQty: 5000 + Math.floor(Math.random() * 10000), leadTimeDays: 15,
        portOfDispatch: supplier.country === 'Pakistan' ? 'Karachi' : 'Main Port',
        tags: p.tags, status: 'ACTIVE', isFeatured: p.isFeatured || false,
        viewCount: Math.floor(Math.random() * 5000), inquiryCount: Math.floor(Math.random() * 200),
        rating: 4 + Math.random(), reviewCount: Math.floor(Math.random() * 50),
        images: { create: p.images.map((url, idx) => ({ url, altText: p.title, sortOrder: idx, isPrimary: idx === 0 })) },
      },
    });
    for (let r = 0; r < Math.floor(Math.random() * 3) + 1; r++) {
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      await prisma.review.create({ data: { productId: product.id, authorId: buyer.id, targetId: supplier.id, rating: 4 + Math.floor(Math.random() * 2), title: 'Great quality', comment: 'Fast shipping, good communication.', isVerified: true } });
    }
  }

  console.log('📨 Creating sample RFQs...');
  await prisma.rFQ.create({ data: { buyerId: buyers[0].id, title: 'Looking for 5000pcs Cotton T-Shirts', description: 'Need 5000 pieces for corporate event.', categoryId: categories[0].id, quantity: 5000, unit: 'piece', targetPrice: 2.50, currency: 'USD', destination: 'Lahore, Pakistan', status: 'OPEN' } });

  console.log('✅ Seed completed successfully!');
  console.log(`📊 Admin: 1 | Buyers: ${buyers.length} | Suppliers: ${suppliers.length} | Categories: ${categories.length} | Products: ${PRODUCTS.length}`);
  console.log('🔐 Password for all: password123');
}

main().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });