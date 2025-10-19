import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Newhill Spices Platform API',
      version: '1.0.0',
      description: 'A comprehensive API for the Newhill Spices Platform with multi-language and multi-currency support for India and GCC markets.',
      contact: {
        name: 'Newhill Spices Platform Team',
        email: 'api@newhillspices.com',
        url: 'https://newhillspices.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.newhillspices.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        // Base schemas
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            error: {
              type: 'object',
              properties: {
                status: {
                  type: 'integer',
                  description: 'HTTP status code',
                },
                code: {
                  type: 'string',
                  description: 'Error code',
                },
                message: {
                  type: 'string',
                  description: 'Error message',
                },
                details: {
                  type: 'object',
                  description: 'Additional error details',
                },
              },
            },
            meta: {
              type: 'object',
              properties: {
                traceId: {
                  type: 'string',
                  description: 'Request trace ID',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Response timestamp',
                },
                version: {
                  type: 'string',
                  description: 'API version',
                },
              },
            },
          },
        },
        ApiMeta: {
          type: 'object',
          properties: {
            traceId: {
              type: 'string',
              description: 'Request trace ID',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
            },
            version: {
              type: 'string',
              description: 'API version',
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of items',
            },
            limit: {
              type: 'integer',
              description: 'Number of items per page',
            },
            offset: {
              type: 'integer',
              description: 'Number of items to skip',
            },
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            pages: {
              type: 'integer',
              description: 'Total number of pages',
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there are more pages',
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there are previous pages',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
              },
              description: 'Array of items',
            },
            pagination: {
              $ref: '#/components/schemas/PaginationMeta',
            },
          },
        },
        // Product schemas
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Product ID',
            },
            slug: {
              type: 'string',
              description: 'Product slug for URL',
            },
            name: {
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
              description: 'Product name in multiple languages',
            },
            description: {
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
              description: 'Product description in multiple languages',
            },
            shortDescription: {
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
              description: 'Short product description in multiple languages',
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Product price',
            },
            currency: {
              type: 'string',
              minLength: 3,
              maxLength: 3,
              description: 'Currency code (ISO 4217)',
            },
            category: {
              type: 'string',
              description: 'Product category',
            },
            subcategory: {
              type: 'string',
              description: 'Product subcategory',
            },
            weight: {
              type: 'number',
              minimum: 0,
              description: 'Product weight',
            },
            unit: {
              type: 'string',
              enum: ['g', 'kg', 'ml', 'l'],
              description: 'Weight unit',
            },
            inStock: {
              type: 'boolean',
              description: 'Whether product is in stock',
            },
            stockQuantity: {
              type: 'integer',
              minimum: 0,
              description: 'Available stock quantity',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
              description: 'Product images',
            },
            variants: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ProductVariant',
              },
              description: 'Product variants',
            },
            lots: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ProductLot',
              },
              description: 'Product lots',
            },
            certifications: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Product certifications',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Product tags',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether product is active',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Publication timestamp',
            },
          },
        },
        ProductVariant: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Variant ID',
            },
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'Product ID',
            },
            name: {
              type: 'string',
              description: 'Variant name',
            },
            weight: {
              type: 'number',
              minimum: 0,
              description: 'Variant weight',
            },
            unit: {
              type: 'string',
              description: 'Weight unit',
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Variant price',
            },
            sku: {
              type: 'string',
              description: 'Stock keeping unit',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether variant is active',
            },
          },
        },
        ProductLot: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Lot ID',
            },
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'Product ID',
            },
            lotNumber: {
              type: 'string',
              description: 'Lot number',
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Lot quantity',
            },
            reservedQuantity: {
              type: 'integer',
              minimum: 0,
              description: 'Reserved quantity',
            },
            expiryDate: {
              type: 'string',
              format: 'date',
              description: 'Expiry date',
            },
            batchDate: {
              type: 'string',
              format: 'date',
              description: 'Batch date',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether lot is active',
            },
            metadata: {
              type: 'object',
              description: 'Additional lot metadata',
            },
          },
        },
        // Cart schemas
        Cart: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Cart ID',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem',
              },
              description: 'Cart items',
            },
            subtotal: {
              type: 'number',
              minimum: 0,
              description: 'Subtotal amount',
            },
            tax: {
              type: 'number',
              minimum: 0,
              description: 'Tax amount',
            },
            shipping: {
              type: 'number',
              minimum: 0,
              description: 'Shipping amount',
            },
            total: {
              type: 'number',
              minimum: 0,
              description: 'Total amount',
            },
            currency: {
              type: 'string',
              minLength: 3,
              maxLength: 3,
              description: 'Currency code',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Cart item ID',
            },
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'Product ID',
            },
            variantId: {
              type: 'string',
              format: 'uuid',
              description: 'Variant ID',
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Item quantity',
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Item price',
            },
            addedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When item was added',
            },
          },
        },
        // Order schemas
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Order ID',
            },
            orderNumber: {
              type: 'string',
              description: 'Order number',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
              description: 'Order items',
            },
            subtotal: {
              type: 'number',
              minimum: 0,
              description: 'Subtotal amount',
            },
            tax: {
              type: 'number',
              minimum: 0,
              description: 'Tax amount',
            },
            shipping: {
              type: 'number',
              minimum: 0,
              description: 'Shipping amount',
            },
            discount: {
              type: 'number',
              minimum: 0,
              description: 'Discount amount',
            },
            total: {
              type: 'number',
              minimum: 0,
              description: 'Total amount',
            },
            currency: {
              type: 'string',
              minLength: 3,
              maxLength: 3,
              description: 'Currency code',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
              description: 'Order status',
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
              description: 'Payment status',
            },
            shippingAddress: {
              $ref: '#/components/schemas/Address',
            },
            billingAddress: {
              $ref: '#/components/schemas/Address',
            },
            paymentMethod: {
              $ref: '#/components/schemas/PaymentMethod',
            },
            shippingMethod: {
              $ref: '#/components/schemas/ShippingMethod',
            },
            trackingNumber: {
              type: 'string',
              description: 'Tracking number',
            },
            notes: {
              type: 'string',
              description: 'Order notes',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
            shippedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Shipment timestamp',
            },
            deliveredAt: {
              type: 'string',
              format: 'date-time',
              description: 'Delivery timestamp',
            },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Order item ID',
            },
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'Product ID',
            },
            variantId: {
              type: 'string',
              format: 'uuid',
              description: 'Variant ID',
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              description: 'Item quantity',
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Item price',
            },
            total: {
              type: 'number',
              minimum: 0,
              description: 'Item total',
            },
            productSnapshot: {
              type: 'object',
              description: 'Product snapshot at time of order',
            },
          },
        },
        Address: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Address ID',
            },
            firstName: {
              type: 'string',
              description: 'First name',
            },
            lastName: {
              type: 'string',
              description: 'Last name',
            },
            company: {
              type: 'string',
              description: 'Company name',
            },
            address1: {
              type: 'string',
              description: 'Address line 1',
            },
            address2: {
              type: 'string',
              description: 'Address line 2',
            },
            city: {
              type: 'string',
              description: 'City',
            },
            state: {
              type: 'string',
              description: 'State',
            },
            postalCode: {
              type: 'string',
              description: 'Postal code',
            },
            country: {
              type: 'string',
              minLength: 2,
              maxLength: 2,
              description: 'Country code (ISO 3166-1 alpha-2)',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            isDefault: {
              type: 'boolean',
              description: 'Whether this is the default address',
            },
          },
        },
        PaymentMethod: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Payment method ID',
            },
            type: {
              type: 'string',
              enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'],
              description: 'Payment method type',
            },
            provider: {
              type: 'string',
              enum: ['stripe', 'razorpay', 'paypal'],
              description: 'Payment provider',
            },
            last4: {
              type: 'string',
              description: 'Last 4 digits of card',
            },
            brand: {
              type: 'string',
              description: 'Card brand',
            },
            expiryMonth: {
              type: 'integer',
              minimum: 1,
              maximum: 12,
              description: 'Expiry month',
            },
            expiryYear: {
              type: 'integer',
              description: 'Expiry year',
            },
          },
        },
        ShippingMethod: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Shipping method ID',
            },
            name: {
              type: 'string',
              description: 'Shipping method name',
            },
            description: {
              type: 'string',
              description: 'Shipping method description',
            },
            cost: {
              type: 'number',
              minimum: 0,
              description: 'Shipping cost',
            },
            estimatedDays: {
              type: 'integer',
              minimum: 1,
              description: 'Estimated delivery days',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether method is active',
            },
          },
        },
        // Wishlist schemas
        WishlistItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Wishlist item ID',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'Product ID',
            },
            addedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When item was added',
            },
            product: {
              $ref: '#/components/schemas/Product',
            },
          },
        },
        // Search schemas
        SearchResult: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product',
              },
              description: 'Search results',
            },
            suggestions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Search suggestions',
            },
            didYouMean: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Did you mean suggestions',
            },
            filters: {
              type: 'object',
              properties: {
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                      },
                      count: {
                        type: 'integer',
                      },
                    },
                  },
                },
                priceRange: {
                  type: 'object',
                  properties: {
                    min: {
                      type: 'number',
                    },
                    max: {
                      type: 'number',
                    },
                  },
                },
                certifications: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                      },
                      count: {
                        type: 'integer',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // Admin schemas
        AdminKPI: {
          type: 'object',
          properties: {
            revenue: {
              type: 'object',
              properties: {
                total: {
                  type: 'number',
                  description: 'Total revenue',
                },
                today: {
                  type: 'number',
                  description: 'Today\'s revenue',
                },
                thisMonth: {
                  type: 'number',
                  description: 'This month\'s revenue',
                },
                lastMonth: {
                  type: 'number',
                  description: 'Last month\'s revenue',
                },
                growth: {
                  type: 'number',
                  description: 'Revenue growth percentage',
                },
              },
            },
            orders: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Total orders',
                },
                pending: {
                  type: 'integer',
                  description: 'Pending orders',
                },
                processing: {
                  type: 'integer',
                  description: 'Processing orders',
                },
                shipped: {
                  type: 'integer',
                  description: 'Shipped orders',
                },
                delivered: {
                  type: 'integer',
                  description: 'Delivered orders',
                },
                cancelled: {
                  type: 'integer',
                  description: 'Cancelled orders',
                },
              },
            },
            products: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Total products',
                },
                active: {
                  type: 'integer',
                  description: 'Active products',
                },
                outOfStock: {
                  type: 'integer',
                  description: 'Out of stock products',
                },
                lowStock: {
                  type: 'integer',
                  description: 'Low stock products',
                },
              },
            },
            customers: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Total customers',
                },
                new: {
                  type: 'integer',
                  description: 'New customers',
                },
                active: {
                  type: 'integer',
                  description: 'Active customers',
                },
                b2b: {
                  type: 'integer',
                  description: 'B2B customers',
                },
              },
            },
            averageOrderValue: {
              type: 'number',
              description: 'Average order value',
            },
            conversionRate: {
              type: 'number',
              description: 'Conversion rate percentage',
            },
          },
        },
        SystemToggle: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Toggle ID',
            },
            key: {
              type: 'string',
              description: 'Toggle key',
            },
            value: {
              type: 'boolean',
              description: 'Toggle value',
            },
            description: {
              type: 'string',
              description: 'Toggle description',
            },
            category: {
              type: 'string',
              description: 'Toggle category',
            },
            updatedBy: {
              type: 'string',
              format: 'uuid',
              description: 'User who updated the toggle',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        CurrencyRate: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Rate ID',
            },
            from: {
              type: 'string',
              minLength: 3,
              maxLength: 3,
              description: 'From currency code',
            },
            to: {
              type: 'string',
              minLength: 3,
              maxLength: 3,
              description: 'To currency code',
            },
            rate: {
              type: 'number',
              minimum: 0,
              description: 'Exchange rate',
            },
            source: {
              type: 'string',
              description: 'Rate source',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Audit log ID',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            action: {
              type: 'string',
              description: 'Action performed',
            },
            entity: {
              type: 'string',
              description: 'Entity type',
            },
            entityId: {
              type: 'string',
              description: 'Entity ID',
            },
            changes: {
              type: 'object',
              description: 'Changes made',
            },
            ipAddress: {
              type: 'string',
              description: 'IP address',
            },
            userAgent: {
              type: 'string',
              description: 'User agent',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
        },
        // Webhook schemas
        PaymentWebhook: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Webhook event ID',
            },
            type: {
              type: 'string',
              description: 'Event type',
            },
            data: {
              type: 'object',
              description: 'Event data',
            },
            created: {
              type: 'integer',
              description: 'Event creation timestamp',
            },
          },
        },
        ShippingWebhook: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              format: 'uuid',
              description: 'Order ID',
            },
            trackingNumber: {
              type: 'string',
              description: 'Tracking number',
            },
            status: {
              type: 'string',
              description: 'Shipping status',
            },
            carrier: {
              type: 'string',
              description: 'Shipping carrier',
            },
            estimatedDelivery: {
              type: 'string',
              format: 'date-time',
              description: 'Estimated delivery date',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Products',
        description: 'Product management endpoints',
      },
      {
        name: 'Search',
        description: 'Search and discovery endpoints',
      },
      {
        name: 'Cart',
        description: 'Shopping cart management',
      },
      {
        name: 'Orders',
        description: 'Order management and checkout',
      },
      {
        name: 'Wishlist',
        description: 'Wishlist management',
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints',
      },
      {
        name: 'Webhooks',
        description: 'Webhook endpoints for external services',
      },
    ],
  },
  apis: [
    './src/routes/v1/*.ts',
    './src/routes/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Newhill Spices Platform API Documentation',
  }));
};

export default specs;

