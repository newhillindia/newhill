import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Super Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@newhillspices.com' },
    update: {},
    create: {
      email: 'admin@newhillspices.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+91-9876543210',
          address: 'Newhill Spices Headquarters',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          postalCode: '400001',
          preferredLanguage: 'en',
          defaultCurrency: 'INR',
        },
      },
    },
  });

  // 2. Create B2B Buyer
  const b2bPassword = await bcrypt.hash('b2b123', 12);
  const b2bUser = await prisma.user.upsert({
    where: { email: 'b2b@restaurant.com' },
    update: {},
    create: {
      email: 'b2b@restaurant.com',
      name: 'Restaurant Owner',
      password: b2bPassword,
      role: 'B2B',
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: 'Rajesh',
          lastName: 'Kumar',
          phone: '+91-9876543211',
          address: '123 Business Street',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          postalCode: '110001',
          preferredLanguage: 'hi',
          defaultCurrency: 'INR',
        },
      },
      b2bApplication: {
        create: {
          businessName: 'Spice Garden Restaurant',
          businessType: 'restaurant',
          gstVatNumber: '29ABCDE1234F1Z5',
          businessAddress: '123 Business Street, Delhi',
          businessCity: 'Delhi',
          businessState: 'Delhi',
          businessCountry: 'India',
          businessPostalCode: '110001',
          contactPerson: 'Rajesh Kumar',
          contactPhone: '+91-9876543211',
          website: 'https://spicegarden.com',
          expectedMonthlyVolume: '100-500',
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: admin.id,
        },
      },
    },
  });

  // 3. Create B2C Users
  const b2cUsers = [
    {
      email: 'customer1@example.com',
      name: 'Priya Sharma',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91-9876543212',
      city: 'Mumbai',
      state: 'Maharashtra',
      preferredLanguage: 'en',
    },
    {
      email: 'customer2@example.com',
      name: 'Ahmed Al-Rashid',
      firstName: 'Ahmed',
      lastName: 'Al-Rashid',
      phone: '+971-501234567',
      city: 'Dubai',
      state: 'Dubai',
      preferredLanguage: 'ar',
    },
    {
      email: 'customer3@example.com',
      name: 'John Smith',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-123-4567',
      city: 'New York',
      state: 'NY',
      preferredLanguage: 'en',
    },
  ];

  for (const userData of b2cUsers) {
    const password = await bcrypt.hash('customer123', 12);
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password,
        role: 'B2C',
        emailVerified: new Date(),
        profile: {
          create: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            address: `123 Main Street, ${userData.city}`,
            city: userData.city,
            state: userData.state,
            country: userData.city === 'Dubai' ? 'UAE' : userData.city === 'New York' ? 'USA' : 'India',
            postalCode: userData.city === 'Dubai' ? '12345' : userData.city === 'New York' ? '10001' : '400001',
            preferredLanguage: userData.preferredLanguage,
            defaultCurrency: userData.city === 'Dubai' ? 'AED' : userData.city === 'New York' ? 'USD' : 'INR',
          },
        },
      },
    });
  }

  // 4. Create Currency Rates
  const currencyRates = [
    { from: 'INR', to: 'QAR', rate: 0.045 },
    { from: 'INR', to: 'AED', rate: 0.044 },
    { from: 'INR', to: 'SAR', rate: 0.045 },
    { from: 'INR', to: 'OMR', rate: 0.0045 },
    { from: 'QAR', to: 'INR', rate: 22.22 },
    { from: 'AED', to: 'INR', rate: 22.73 },
    { from: 'SAR', to: 'INR', rate: 22.22 },
    { from: 'OMR', to: 'INR', rate: 222.22 },
  ];

  for (const rate of currencyRates) {
    await prisma.currencyRate.upsert({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency: rate.from,
          toCurrency: rate.to,
        },
      },
      update: { rate: rate.rate },
      create: {
        fromCurrency: rate.from,
        toCurrency: rate.to,
        rate: rate.rate,
        lastUpdated: new Date(),
      },
    });
  }

  // 5. Create Products and Variants
  const spices = [
    {
      name: 'Premium Cardamom',
      description: 'Hand-picked green cardamom from the hills of Kerala',
      category: 'Spices',
      organicCertified: true,
      variants: [
        { weight: 100, price: 450 },
        { weight: 250, price: 1100 },
        { weight: 500, price: 2100 },
        { weight: 1000, price: 4000 },
      ],
    },
    {
      name: 'Black Pepper',
      description: 'Premium black pepper from the Malabar coast',
      category: 'Spices',
      organicCertified: true,
      variants: [
        { weight: 100, price: 180 },
        { weight: 250, price: 420 },
        { weight: 500, price: 800 },
        { weight: 1000, price: 1500 },
      ],
    },
    {
      name: 'Cloves',
      description: 'Aromatic cloves from Zanzibar',
      category: 'Spices',
      organicCertified: false,
      variants: [
        { weight: 100, price: 320 },
        { weight: 250, price: 750 },
        { weight: 500, price: 1400 },
        { weight: 1000, price: 2700 },
      ],
    },
    {
      name: 'Cinnamon',
      description: 'Ceylon cinnamon sticks from Sri Lanka',
      category: 'Spices',
      organicCertified: true,
      variants: [
        { weight: 100, price: 280 },
        { weight: 250, price: 650 },
        { weight: 500, price: 1200 },
        { weight: 1000, price: 2300 },
      ],
    },
    {
      name: 'Turmeric',
      description: 'Pure organic turmeric powder',
      category: 'Spices',
      organicCertified: true,
      variants: [
        { weight: 100, price: 150 },
        { weight: 250, price: 350 },
        { weight: 500, price: 650 },
        { weight: 1000, price: 1200 },
      ],
    },
    {
      name: 'Nutmeg',
      description: 'Whole nutmeg from Indonesia',
      category: 'Spices',
      organicCertified: false,
      variants: [
        { weight: 100, price: 400 },
        { weight: 250, price: 950 },
        { weight: 500, price: 1800 },
        { weight: 1000, price: 3500 },
      ],
    },
  ];

  const createdProducts = [];
  for (const spice of spices) {
    const product = await prisma.product.create({
      data: {
        name: spice.name,
        description: spice.description,
        category: spice.category,
        organicCertified: spice.organicCertified,
        defaultCurrency: 'INR',
        variants: {
          create: spice.variants.map(variant => ({
            weightInGrams: variant.weight,
            basePriceINR: variant.price,
            stockQty: Math.floor(Math.random() * 100) + 50,
            minOrderQty: 1,
            maxOrderQty: variant.weight >= 1000 ? 10 : 50,
          })),
        },
      },
      include: {
        variants: true,
      },
    });
    createdProducts.push(product);
  }

  // 6. Create Product Translations
  const productTranslations = [
    // Cardamom
    { productId: createdProducts[0].id, en: { name: 'Premium Cardamom', description: 'Hand-picked green cardamom from the hills of Kerala' }, ar: { name: 'هيل مميز', description: 'هيل أخضر منتقى يدوياً من تلال كيرالا' }, hi: { name: 'प्रीमियम इलायची', description: 'केरल की पहाड़ियों से हाथ से चुनी गई हरी इलायची' } },
    // Black Pepper
    { productId: createdProducts[1].id, en: { name: 'Black Pepper', description: 'Premium black pepper from the Malabar coast' }, ar: { name: 'فلفل أسود', description: 'فلفل أسود مميز من ساحل مالابار' }, hi: { name: 'काली मिर्च', description: 'मालाबार तट से प्रीमियम काली मिर्च' } },
    // Cloves
    { productId: createdProducts[2].id, en: { name: 'Cloves', description: 'Aromatic cloves from Zanzibar' }, ar: { name: 'قرنفل', description: 'قرنفل عطري من زنجبار' }, hi: { name: 'लौंग', description: 'जंजीबार से सुगंधित लौंग' } },
    // Cinnamon
    { productId: createdProducts[3].id, en: { name: 'Cinnamon', description: 'Ceylon cinnamon sticks from Sri Lanka' }, ar: { name: 'قرفة', description: 'عصي قرفة سيلان من سريلانكا' }, hi: { name: 'दालचीनी', description: 'श्रीलंका से सीलोन दालचीनी की छड़ें' } },
    // Turmeric
    { productId: createdProducts[4].id, en: { name: 'Turmeric', description: 'Pure organic turmeric powder' }, ar: { name: 'كركم', description: 'مسحوق كركم عضوي نقي' }, hi: { name: 'हल्दी', description: 'शुद्ध जैविक हल्दी पाउडर' } },
    // Nutmeg
    { productId: createdProducts[5].id, en: { name: 'Nutmeg', description: 'Whole nutmeg from Indonesia' }, ar: { name: 'جوزة الطيب', description: 'جوزة الطيب الكاملة من إندونيسيا' }, hi: { name: 'जायफल', description: 'इंडोनेशिया से पूरा जायफल' } },
  ];

  for (const translation of productTranslations) {
    for (const [lang, data] of Object.entries(translation)) {
      if (lang !== 'productId') {
        await prisma.productTranslation.create({
          data: {
            productId: translation.productId,
            language: lang as 'en' | 'ar' | 'hi',
            name: data.name,
            description: data.description,
          },
        });
      }
    }
  }

  // 7. Create Lots for each variant
  for (const product of createdProducts) {
    for (const variant of product.variants) {
      const lots = [
        {
          batchCode: `BATCH-${variant.id.slice(-8).toUpperCase()}-001`,
          originEstate: 'Kerala Hills Estate',
          harvestedOn: new Date('2024-01-15'),
          bestBefore: new Date('2025-01-15'),
          qcNotes: 'Premium quality, passed all tests',
          qtyAvailable: Math.floor(variant.stockQty * 0.6),
          qtyReserved: 0,
        },
        {
          batchCode: `BATCH-${variant.id.slice(-8).toUpperCase()}-002`,
          originEstate: 'Malabar Coast Estate',
          harvestedOn: new Date('2024-02-10'),
          bestBefore: new Date('2025-02-10'),
          qcNotes: 'Excellent aroma and flavor',
          qtyAvailable: Math.floor(variant.stockQty * 0.4),
          qtyReserved: 0,
        },
      ];

      for (const lot of lots) {
        await prisma.lot.create({
          data: {
            variantId: variant.id,
            ...lot,
          },
        });
      }
    }
  }

  // 8. Create Discount Codes
  const discountCodes = [
    {
      code: 'WELCOME10',
      name: 'Welcome Discount',
      description: '10% off for new customers',
      type: 'PERCENTAGE',
      value: 10,
      minOrderValue: 1000,
      maxDiscountAmount: 500,
      usageLimit: 1000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isB2BOnly: false,
    },
    {
      code: 'B2B20',
      name: 'Business Discount',
      description: '20% off for business customers',
      type: 'PERCENTAGE',
      value: 20,
      minOrderValue: 5000,
      maxDiscountAmount: 2000,
      usageLimit: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      isB2BOnly: true,
    },
    {
      code: 'FREESHIP',
      name: 'Free Shipping',
      description: 'Free shipping on orders above ₹2000',
      type: 'FREE_SHIPPING',
      value: 0,
      minOrderValue: 2000,
      usageLimit: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      isB2BOnly: false,
    },
  ];

  for (const discount of discountCodes) {
    await prisma.discountCode.create({
      data: discount,
    });
  }

  // 9. Create Sample Orders
  const b2cUser = await prisma.user.findFirst({ where: { role: 'B2C' } });
  const b2bUser = await prisma.user.findFirst({ where: { role: 'B2B' } });

  if (b2cUser) {
    // Create address for B2C user
    const address = await prisma.address.create({
      data: {
        userId: b2cUser.id,
        type: 'SHIPPING',
        firstName: 'Priya',
        lastName: 'Sharma',
        address1: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
        phone: '+91-9876543212',
        isDefault: true,
      },
    });

    // Create sample order
    const order = await prisma.order.create({
      data: {
        userId: b2cUser.id,
        orderNumber: `ORD-${Date.now()}`,
        status: 'DELIVERED',
        totalAmount: 1250,
        currency: 'INR',
        shippingAddressId: address.id,
        billingAddressId: address.id,
        notes: 'Please deliver during business hours',
      },
    });

    // Add order items
    const cardamomVariant = createdProducts[0].variants[0];
    const pepperVariant = createdProducts[1].variants[0];
    const lot = await prisma.lot.findFirst({ where: { variantId: cardamomVariant.id } });

    await prisma.orderItem.createMany({
      data: [
        {
          orderId: order.id,
          variantId: cardamomVariant.id,
          lotId: lot?.id,
          quantity: 2,
          unitPrice: 450,
          totalPrice: 900,
        },
        {
          orderId: order.id,
          variantId: pepperVariant.id,
          quantity: 1,
          unitPrice: 180,
          totalPrice: 180,
        },
      ],
    });

    // Create shipment
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        trackingNumber: `TRK-${Date.now()}`,
        carrier: 'Blue Dart',
        status: 'DELIVERED',
        shippedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 10. Create Translation Keys
  const translationKeys = [
    // Common
    { key: 'common.loading', en: 'Loading...', ar: 'جاري التحميل...', hi: 'लोड हो रहा है...' },
    { key: 'common.error', en: 'An error occurred', ar: 'حدث خطأ', hi: 'एक त्रुटि हुई' },
    { key: 'common.success', en: 'Success', ar: 'نجح', hi: 'सफलता' },
    { key: 'common.cancel', en: 'Cancel', ar: 'إلغاء', hi: 'रद्द करें' },
    { key: 'common.save', en: 'Save', ar: 'حفظ', hi: 'सहेजें' },
    { key: 'common.delete', en: 'Delete', ar: 'حذف', hi: 'हटाएं' },
    { key: 'common.edit', en: 'Edit', ar: 'تعديل', hi: 'संपादित करें' },
    { key: 'common.back', en: 'Back', ar: 'رجوع', hi: 'वापस' },
    { key: 'common.next', en: 'Next', ar: 'التالي', hi: 'अगला' },
    { key: 'common.previous', en: 'Previous', ar: 'السابق', hi: 'पिछला' },
    { key: 'common.submit', en: 'Submit', ar: 'إرسال', hi: 'जमा करें' },
    { key: 'common.close', en: 'Close', ar: 'إغلاق', hi: 'बंद करें' },
    { key: 'common.confirm', en: 'Confirm', ar: 'تأكيد', hi: 'पुष्टि करें' },
    { key: 'common.yes', en: 'Yes', ar: 'نعم', hi: 'हाँ' },
    { key: 'common.no', en: 'No', ar: 'لا', hi: 'नहीं' },

    // Product
    { key: 'product.addToCart', en: 'Add to Cart', ar: 'أضف إلى السلة', hi: 'कार्ट में जोड़ें' },
    { key: 'product.outOfStock', en: 'Out of Stock', ar: 'نفدت الكمية', hi: 'स्टॉक खत्म' },
    { key: 'product.inStock', en: 'In Stock', ar: 'متوفر', hi: 'स्टॉक में' },
    { key: 'product.organic', en: 'Organic', ar: 'عضوي', hi: 'जैविक' },
    { key: 'product.premium', en: 'Premium', ar: 'مميز', hi: 'प्रीमियम' },
    { key: 'product.weight', en: 'Weight', ar: 'الوزن', hi: 'वजन' },
    { key: 'product.price', en: 'Price', ar: 'السعر', hi: 'कीमत' },
    { key: 'product.description', en: 'Description', ar: 'الوصف', hi: 'विवरण' },
    { key: 'product.category', en: 'Category', ar: 'الفئة', hi: 'श्रेणी' },

    // Cart
    { key: 'cart.title', en: 'Shopping Cart', ar: 'سلة التسوق', hi: 'खरीदारी की टोकरी' },
    { key: 'cart.empty', en: 'Your cart is empty', ar: 'سلتك فارغة', hi: 'आपकी टोकरी खाली है' },
    { key: 'cart.quantity', en: 'Quantity', ar: 'الكمية', hi: 'मात्रा' },
    { key: 'cart.total', en: 'Total', ar: 'المجموع', hi: 'कुल' },
    { key: 'cart.checkout', en: 'Checkout', ar: 'الدفع', hi: 'चेकआउट' },
    { key: 'cart.remove', en: 'Remove', ar: 'إزالة', hi: 'हटाएं' },
    { key: 'cart.update', en: 'Update', ar: 'تحديث', hi: 'अपडेट करें' },

    // Order
    { key: 'order.orderNumber', en: 'Order Number', ar: 'رقم الطلب', hi: 'ऑर्डर नंबर' },
    { key: 'order.status', en: 'Status', ar: 'الحالة', hi: 'स्थिति' },
    { key: 'order.date', en: 'Date', ar: 'التاريخ', hi: 'तारीख' },
    { key: 'order.total', en: 'Total', ar: 'المجموع', hi: 'कुल' },
    { key: 'order.shipping', en: 'Shipping', ar: 'الشحن', hi: 'शिपिंग' },
    { key: 'order.tracking', en: 'Tracking', ar: 'التتبع', hi: 'ट्रैकिंग' },

    // Discount
    { key: 'discount.code', en: 'Discount Code', ar: 'كود الخصم', hi: 'छूट कोड' },
    { key: 'discount.apply', en: 'Apply', ar: 'تطبيق', hi: 'लागू करें' },
    { key: 'discount.remove', en: 'Remove', ar: 'إزالة', hi: 'हटाएं' },
    { key: 'discount.savings', en: 'Savings', ar: 'التوفير', hi: 'बचत' },
    { key: 'discount.invalid', en: 'Invalid discount code', ar: 'كود خصم غير صالح', hi: 'अमान्य छूट कोड' },
    { key: 'discount.expired', en: 'Discount code expired', ar: 'انتهت صلاحية كود الخصم', hi: 'छूट कोड समाप्त हो गया' },
  ];

  for (const translation of translationKeys) {
    for (const [lang, value] of Object.entries(translation)) {
      if (lang !== 'key') {
        await prisma.translationKey.create({
          data: {
            key: translation.key,
            language: lang as 'en' | 'ar' | 'hi',
            value: value,
          },
        });
      }
    }
  }

  // 11. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        entity: 'USER',
        entityId: b2bUser.id,
        action: 'B2B_APPLICATION_APPROVED',
        details: { businessName: 'Spice Garden Restaurant' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        userId: b2cUser?.id,
        entity: 'ORDER',
        entityId: 'sample-order-1',
        action: 'ORDER_CREATED',
        details: { orderNumber: 'ORD-123456' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('👤 Admin user: admin@newhillspices.com / admin123');
  console.log('🏢 B2B user: b2b@restaurant.com / b2b123');
  console.log('👥 B2C users: customer1@example.com, customer2@example.com, customer3@example.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
