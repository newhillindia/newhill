import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DiscountValidation {
  valid: boolean;
  discountAmount: number;
  message?: string;
  discount?: any;
}

export interface CouponValidation {
  valid: boolean;
  discountAmount: number;
  message?: string;
  coupon?: any;
}

export interface OrderDiscount {
  discountId: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  discountAmount: number;
  maxDiscountAmount?: number;
}

/**
 * Validate and calculate discount for a discount code
 */
export async function validateDiscountCode(
  code: string,
  orderAmount: number,
  userId?: string,
  isB2B: boolean = false
): Promise<DiscountValidation> {
  try {
    const discount = await prisma.discountCode.findUnique({
      where: { code },
    });

    if (!discount) {
      return { valid: false, discountAmount: 0, message: 'Invalid discount code' };
    }

    if (!discount.isActive) {
      return { valid: false, discountAmount: 0, message: 'Discount code is not active' };
    }

    const now = new Date();
    if (discount.validFrom > now) {
      return { valid: false, discountAmount: 0, message: 'Discount code is not yet valid' };
    }

    if (discount.validUntil && discount.validUntil < now) {
      return { valid: false, discountAmount: 0, message: 'Discount code has expired' };
    }

    if (discount.isB2BOnly && !isB2B) {
      return { valid: false, discountAmount: 0, message: 'This discount is only available for business customers' };
    }

    if (discount.minOrderValue && orderAmount < Number(discount.minOrderValue)) {
      return { 
        valid: false, 
        discountAmount: 0, 
        message: `Minimum order value of ${discount.minOrderValue} required` 
      };
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return { valid: false, discountAmount: 0, message: 'Discount code usage limit reached' };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * Number(discount.value)) / 100;
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = Number(discount.value);
    } else if (discount.type === 'FREE_SHIPPING') {
      // This would be handled separately in shipping calculation
      discountAmount = 0;
    }

    // Apply maximum discount limit
    if (discount.maxDiscountAmount && discountAmount > Number(discount.maxDiscountAmount)) {
      discountAmount = Number(discount.maxDiscountAmount);
    }

    // Ensure discount doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    return {
      valid: true,
      discountAmount,
      discount,
    };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { valid: false, discountAmount: 0, message: 'Error validating discount code' };
  }
}

/**
 * Validate and calculate discount for a coupon (one-time use per user)
 */
export async function validateCoupon(
  code: string,
  orderAmount: number,
  userId: string,
  isB2B: boolean = false
): Promise<CouponValidation> {
  try {
    const discount = await prisma.discountCode.findUnique({
      where: { code },
    });

    if (!discount) {
      return { valid: false, discountAmount: 0, message: 'Invalid coupon code' };
    }

    if (!discount.isActive) {
      return { valid: false, discountAmount: 0, message: 'Coupon is not active' };
    }

    const now = new Date();
    if (discount.validFrom > now) {
      return { valid: false, discountAmount: 0, message: 'Coupon is not yet valid' };
    }

    if (discount.validUntil && discount.validUntil < now) {
      return { valid: false, discountAmount: 0, message: 'Coupon has expired' };
    }

    if (discount.isB2BOnly && !isB2B) {
      return { valid: false, discountAmount: 0, message: 'This coupon is only available for business customers' };
    }

    if (discount.minOrderValue && orderAmount < Number(discount.minOrderValue)) {
      return { 
        valid: false, 
        discountAmount: 0, 
        message: `Minimum order value of ${discount.minOrderValue} required` 
      };
    }

    // Check if user has already used this coupon
    const existingRedemption = await prisma.couponRedemption.findFirst({
      where: {
        userId,
        discount: { code },
      },
    });

    if (existingRedemption) {
      return { valid: false, discountAmount: 0, message: 'You have already used this coupon' };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * Number(discount.value)) / 100;
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = Number(discount.value);
    } else if (discount.type === 'FREE_SHIPPING') {
      discountAmount = 0; // Handled separately
    }

    // Apply maximum discount limit
    if (discount.maxDiscountAmount && discountAmount > Number(discount.maxDiscountAmount)) {
      discountAmount = Number(discount.maxDiscountAmount);
    }

    // Ensure discount doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    return {
      valid: true,
      discountAmount,
      coupon: discount,
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, discountAmount: 0, message: 'Error validating coupon' };
  }
}

/**
 * Apply discount to order items
 */
export async function applyDiscountToOrder(
  orderId: string,
  discountCode: string,
  userId: string,
  isB2B: boolean = false
): Promise<{ success: boolean; message?: string; discountAmount?: number }> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    const orderAmount = Number(order.totalAmount);
    const validation = await validateDiscountCode(discountCode, orderAmount, userId, isB2B);

    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // Update order items with discount
    const discount = validation.discount;
    const discountPerItem = validation.discountAmount / order.items.length;

    for (const item of order.items) {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          discountId: discount.id,
          totalPrice: Number(item.totalPrice) - discountPerItem,
        },
      });
    }

    // Update order total
    await prisma.order.update({
      where: { id: orderId },
      data: {
        totalAmount: orderAmount - validation.discountAmount,
      },
    });

    // Increment usage count
    await prisma.discountCode.update({
      where: { id: discount.id },
      data: {
        usedCount: { increment: 1 },
      },
    });

    return { 
      success: true, 
      discountAmount: validation.discountAmount 
    };
  } catch (error) {
    console.error('Error applying discount:', error);
    return { success: false, message: 'Error applying discount' };
  }
}

/**
 * Apply coupon to order item
 */
export async function applyCouponToOrderItem(
  orderItemId: string,
  couponCode: string,
  userId: string,
  isB2B: boolean = false
): Promise<{ success: boolean; message?: string; discountAmount?: number }> {
  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
        variant: true,
      },
    });

    if (!orderItem) {
      return { success: false, message: 'Order item not found' };
    }

    const itemAmount = Number(orderItem.totalPrice);
    const validation = await validateCoupon(couponCode, itemAmount, userId, isB2B);

    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // Create coupon redemption
    await prisma.couponRedemption.create({
      data: {
        userId,
        orderItemId,
        discountId: validation.coupon.id,
        amount: validation.discountAmount,
      },
    });

    // Update order item with discount
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        discountId: validation.coupon.id,
        totalPrice: itemAmount - validation.discountAmount,
      },
    });

    // Update order total
    const newOrderTotal = Number(orderItem.order.totalAmount) - validation.discountAmount;
    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: {
        totalAmount: newOrderTotal,
      },
    });

    return { 
      success: true, 
      discountAmount: validation.discountAmount 
    };
  } catch (error) {
    console.error('Error applying coupon:', error);
    return { success: false, message: 'Error applying coupon' };
  }
}

/**
 * Get available discount codes for user
 */
export async function getAvailableDiscounts(
  userId?: string,
  isB2B: boolean = false,
  orderAmount?: number
): Promise<any[]> {
  try {
    const now = new Date();
    const discounts = await prisma.discountCode.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
        isB2BOnly: isB2B ? undefined : false,
        ...(orderAmount && { minOrderValue: { lte: orderAmount } }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return discounts;
  } catch (error) {
    console.error('Error getting available discounts:', error);
    return [];
  }
}

/**
 * Get user's coupon redemption history
 */
export async function getUserCouponHistory(userId: string): Promise<any[]> {
  try {
    const redemptions = await prisma.couponRedemption.findMany({
      where: { userId },
      include: {
        discount: true,
        orderItem: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return redemptions;
  } catch (error) {
    console.error('Error getting coupon history:', error);
    return [];
  }
}

/**
 * Create a new discount code
 */
export async function createDiscountCode(data: {
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: Date;
  validUntil?: Date;
  isB2BOnly?: boolean;
}): Promise<{ success: boolean; message?: string; discount?: any }> {
  try {
    const discount = await prisma.discountCode.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue,
        maxDiscountAmount: data.maxDiscountAmount,
        usageLimit: data.usageLimit,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        isB2BOnly: data.isB2BOnly || false,
      },
    });

    return { success: true, discount };
  } catch (error) {
    console.error('Error creating discount code:', error);
    return { success: false, message: 'Error creating discount code' };
  }
}

/**
 * Get discount code analytics
 */
export async function getDiscountAnalytics(discountId: string): Promise<any> {
  try {
    const discount = await prisma.discountCode.findUnique({
      where: { id: discountId },
      include: {
        orderItems: {
          include: {
            order: {
              select: {
                id: true,
                totalAmount: true,
                createdAt: true,
              },
            },
          },
        },
        couponRedemptions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!discount) {
      return null;
    }

    const totalDiscountGiven = discount.orderItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0
    );

    const totalCouponSavings = discount.couponRedemptions.reduce(
      (sum, redemption) => sum + Number(redemption.amount),
      0
    );

    return {
      discount,
      totalUsage: discount.usedCount,
      totalDiscountGiven,
      totalCouponSavings,
      usageRate: discount.usageLimit ? (discount.usedCount / discount.usageLimit) * 100 : null,
    };
  } catch (error) {
    console.error('Error getting discount analytics:', error);
    return null;
  }
}
