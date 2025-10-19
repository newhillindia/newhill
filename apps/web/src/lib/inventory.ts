import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StockInfo {
  variantId: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  lots: LotStockInfo[];
}

export interface LotStockInfo {
  lotId: string;
  batchCode: string;
  qtyAvailable: number;
  qtyReserved: number;
  status: string;
  bestBefore: Date;
  originEstate: string;
}

export interface InventoryChange {
  variantId: string;
  lotId?: string;
  changeType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'EXPIRED' | 'DAMAGED';
  refType: 'ORDER' | 'B2B' | 'ADMIN' | 'SYSTEM' | 'TRANSFER';
  quantity: number;
  reason?: string;
  warehouseId?: string;
  metadata?: any;
}

/**
 * Get stock information for a product variant
 */
export async function getStockInfo(variantId: string): Promise<StockInfo> {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        lots: {
          where: { status: 'ACTIVE' },
          orderBy: { bestBefore: 'asc' },
        },
      },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    const lots: LotStockInfo[] = variant.lots.map(lot => ({
      lotId: lot.id,
      batchCode: lot.batchCode,
      qtyAvailable: lot.qtyAvailable,
      qtyReserved: lot.qtyReserved,
      status: lot.status,
      bestBefore: lot.bestBefore,
      originEstate: lot.originEstate,
    }));

    const totalStock = lots.reduce((sum, lot) => sum + lot.qtyAvailable + lot.qtyReserved, 0);
    const availableStock = lots.reduce((sum, lot) => sum + lot.qtyAvailable, 0);
    const reservedStock = lots.reduce((sum, lot) => sum + lot.qtyReserved, 0);

    return {
      variantId,
      totalStock,
      availableStock,
      reservedStock,
      lots,
    };
  } catch (error) {
    console.error('Error getting stock info:', error);
    throw error;
  }
}

/**
 * Check if sufficient stock is available for an order
 */
export async function checkStockAvailability(
  variantId: string,
  quantity: number,
  lotId?: string
): Promise<{ available: boolean; availableQty: number; message?: string }> {
  try {
    const stockInfo = await getStockInfo(variantId);

    if (lotId) {
      // Check specific lot
      const lot = stockInfo.lots.find(l => l.lotId === lotId);
      if (!lot) {
        return { available: false, availableQty: 0, message: 'Lot not found' };
      }

      if (lot.status !== 'ACTIVE') {
        return { available: false, availableQty: 0, message: 'Lot is not active' };
      }

      if (lot.qtyAvailable < quantity) {
        return { 
          available: false, 
          availableQty: lot.qtyAvailable, 
          message: `Insufficient stock in lot ${lot.batchCode}. Available: ${lot.qtyAvailable}` 
        };
      }

      return { available: true, availableQty: lot.qtyAvailable };
    } else {
      // Check total available stock
      if (stockInfo.availableStock < quantity) {
        return { 
          available: false, 
          availableQty: stockInfo.availableStock,
          message: `Insufficient stock. Available: ${stockInfo.availableStock}` 
        };
      }

      return { available: true, availableQty: stockInfo.availableStock };
    }
  } catch (error) {
    console.error('Error checking stock availability:', error);
    return { available: false, availableQty: 0, message: 'Error checking stock' };
  }
}

/**
 * Reserve stock for an order
 */
export async function reserveStock(
  variantId: string,
  quantity: number,
  lotId?: string,
  orderId?: string
): Promise<{ success: boolean; reservedLots: Array<{ lotId: string; quantity: number }>; message?: string }> {
  try {
    const stockInfo = await getStockInfo(variantId);
    const reservedLots: Array<{ lotId: string; quantity: number }> = [];
    let remainingQty = quantity;

    // Sort lots by best before date (FIFO)
    const sortedLots = stockInfo.lots
      .filter(lot => lot.status === 'ACTIVE' && lot.qtyAvailable > 0)
      .sort((a, b) => a.bestBefore.getTime() - b.bestBefore.getTime());

    if (lotId) {
      // Reserve from specific lot
      const lot = sortedLots.find(l => l.lotId === lotId);
      if (!lot) {
        return { success: false, reservedLots: [], message: 'Lot not found or not available' };
      }

      const reserveQty = Math.min(remainingQty, lot.qtyAvailable);
      
      await prisma.lot.update({
        where: { id: lotId },
        data: {
          qtyAvailable: lot.qtyAvailable - reserveQty,
          qtyReserved: lot.qtyReserved + reserveQty,
        },
      });

      reservedLots.push({ lotId, quantity: reserveQty });
      remainingQty -= reserveQty;
    } else {
      // Reserve from multiple lots (FIFO)
      for (const lot of sortedLots) {
        if (remainingQty <= 0) break;

        const reserveQty = Math.min(remainingQty, lot.qtyAvailable);
        
        await prisma.lot.update({
          where: { id: lot.lotId },
          data: {
            qtyAvailable: lot.qtyAvailable - reserveQty,
            qtyReserved: lot.qtyReserved + reserveQty,
          },
        });

        reservedLots.push({ lotId: lot.lotId, quantity: reserveQty });
        remainingQty -= reserveQty;
      }
    }

    if (remainingQty > 0) {
      return { 
        success: false, 
        reservedLots, 
        message: `Could not reserve full quantity. Remaining: ${remainingQty}` 
      };
    }

    // Log the reservation
    await logInventoryChange({
      variantId,
      lotId: lotId || reservedLots[0]?.lotId,
      changeType: 'OUT',
      refType: 'ORDER',
      quantity,
      reason: `Reserved for order ${orderId || 'pending'}`,
      metadata: { orderId, reservedLots },
    });

    return { success: true, reservedLots };
  } catch (error) {
    console.error('Error reserving stock:', error);
    return { success: false, reservedLots: [], message: 'Error reserving stock' };
  }
}

/**
 * Release reserved stock
 */
export async function releaseStock(
  variantId: string,
  reservedLots: Array<{ lotId: string; quantity: number }>,
  orderId?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    for (const { lotId, quantity } of reservedLots) {
      await prisma.lot.update({
        where: { id: lotId },
        data: {
          qtyReserved: { decrement: quantity },
          qtyAvailable: { increment: quantity },
        },
      });
    }

    // Log the release
    await logInventoryChange({
      variantId,
      changeType: 'IN',
      refType: 'ORDER',
      quantity: reservedLots.reduce((sum, lot) => sum + lot.quantity, 0),
      reason: `Released from order ${orderId || 'cancelled'}`,
      metadata: { orderId, releasedLots: reservedLots },
    });

    return { success: true };
  } catch (error) {
    console.error('Error releasing stock:', error);
    return { success: false, message: 'Error releasing stock' };
  }
}

/**
 * Confirm stock allocation (move from reserved to allocated)
 */
export async function confirmStockAllocation(
  variantId: string,
  allocatedLots: Array<{ lotId: string; quantity: number }>,
  orderId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    for (const { lotId, quantity } of allocatedLots) {
      await prisma.lot.update({
        where: { id: lotId },
        data: {
          qtyReserved: { decrement: quantity },
        },
      });
    }

    // Log the allocation
    await logInventoryChange({
      variantId,
      changeType: 'OUT',
      refType: 'ORDER',
      quantity: allocatedLots.reduce((sum, lot) => sum + lot.quantity, 0),
      reason: `Confirmed allocation for order ${orderId}`,
      metadata: { orderId, allocatedLots },
    });

    return { success: true };
  } catch (error) {
    console.error('Error confirming stock allocation:', error);
    return { success: false, message: 'Error confirming stock allocation' };
  }
}

/**
 * Add stock to inventory
 */
export async function addStock(
  variantId: string,
  lotId: string,
  quantity: number,
  reason: string = 'Stock addition',
  metadata?: any
): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.lot.update({
      where: { id: lotId },
      data: {
        qtyAvailable: { increment: quantity },
      },
    });

    // Log the addition
    await logInventoryChange({
      variantId,
      lotId,
      changeType: 'IN',
      refType: 'ADMIN',
      quantity,
      reason,
      metadata,
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding stock:', error);
    return { success: false, message: 'Error adding stock' };
  }
}

/**
 * Adjust stock (for corrections, damages, etc.)
 */
export async function adjustStock(
  variantId: string,
  lotId: string,
  quantity: number,
  reason: string,
  metadata?: any
): Promise<{ success: boolean; message?: string }> {
  try {
    const lot = await prisma.lot.findUnique({
      where: { id: lotId },
    });

    if (!lot) {
      return { success: false, message: 'Lot not found' };
    }

    const newQty = lot.qtyAvailable + quantity;
    if (newQty < 0) {
      return { success: false, message: 'Insufficient stock for adjustment' };
    }

    await prisma.lot.update({
      where: { id: lotId },
      data: {
        qtyAvailable: newQty,
      },
    });

    // Log the adjustment
    await logInventoryChange({
      variantId,
      lotId,
      changeType: quantity > 0 ? 'IN' : 'OUT',
      refType: 'ADMIN',
      quantity: Math.abs(quantity),
      reason,
      metadata,
    });

    return { success: true };
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return { success: false, message: 'Error adjusting stock' };
  }
}

/**
 * Block expired lots
 */
export async function blockExpiredLots(): Promise<{ blockedCount: number; message: string }> {
  try {
    const expiredLots = await prisma.lot.findMany({
      where: {
        status: 'ACTIVE',
        bestBefore: { lt: new Date() },
      },
    });

    let blockedCount = 0;
    for (const lot of expiredLots) {
      await prisma.lot.update({
        where: { id: lot.id },
        data: { status: 'EXPIRED' },
      });

      // Log the blocking
      await logInventoryChange({
        variantId: lot.variantId,
        lotId: lot.id,
        changeType: 'ADJUSTMENT',
        refType: 'SYSTEM',
        quantity: lot.qtyAvailable + lot.qtyReserved,
        reason: 'Lot expired - automatically blocked',
        metadata: { bestBefore: lot.bestBefore },
      });

      blockedCount++;
    }

    return { 
      blockedCount, 
      message: `Blocked ${blockedCount} expired lots` 
    };
  } catch (error) {
    console.error('Error blocking expired lots:', error);
    return { blockedCount: 0, message: 'Error blocking expired lots' };
  }
}

/**
 * Log inventory changes
 */
async function logInventoryChange(change: InventoryChange): Promise<void> {
  try {
    await prisma.inventoryLedger.create({
      data: {
        variantId: change.variantId,
        lotId: change.lotId,
        changeType: change.changeType,
        refType: change.refType,
        quantity: change.quantity,
        reason: change.reason,
        warehouseId: change.warehouseId,
        metadata: change.metadata,
      },
    });
  } catch (error) {
    console.error('Error logging inventory change:', error);
  }
}

/**
 * Get inventory history for a variant
 */
export async function getInventoryHistory(
  variantId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const history = await prisma.inventoryLedger.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        lot: {
          select: {
            batchCode: true,
            originEstate: true,
          },
        },
      },
    });

    return history;
  } catch (error) {
    console.error('Error getting inventory history:', error);
    return [];
  }
}
