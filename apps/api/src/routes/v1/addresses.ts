import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../utils/errors';

const router = Router();
const prisma = new PrismaClient();

// Apply rate limiting
router.use(rateLimitConfigs.general);

// Require authentication for all address routes
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/addresses:
 *   get:
 *     summary: Get user addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: addresses,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Create new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - firstName
 *               - lastName
 *               - address1
 *               - city
 *               - state
 *               - country
 *               - postalCode
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [SHIPPING, BILLING]
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               address1:
 *                 type: string
 *               address2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               phone:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 */
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const {
      type,
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      country,
      postalCode,
      phone,
      isDefault
    } = req.body;

    // Validate required fields
    if (!type || !firstName || !lastName || !address1 || !city || !state || !country || !postalCode) {
      throw new ApiError('Missing required fields', 400, 'MISSING_REQUIRED_FIELDS');
    }

    // If this is set as default, unset other defaults of the same type
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          type: type as 'SHIPPING' | 'BILLING',
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        type: type as 'SHIPPING' | 'BILLING',
        firstName,
        lastName,
        company,
        address1,
        address2,
        city,
        state,
        country,
        postalCode,
        phone,
        isDefault: isDefault || false
      }
    });

    res.status(201).json({
      success: true,
      data: address,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   put:
 *     summary: Update address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [SHIPPING, BILLING]
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               address1:
 *                 type: string
 *               address2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               phone:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Authentication required
 */
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const addressId = req.params.id;

    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!existingAddress) {
      throw new ApiError('Address not found', 404, 'ADDRESS_NOT_FOUND');
    }

    const {
      type,
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      country,
      postalCode,
      phone,
      isDefault
    } = req.body;

    // If this is set as default, unset other defaults of the same type
    if (isDefault && type) {
      await prisma.address.updateMany({
        where: {
          userId,
          type: type as 'SHIPPING' | 'BILLING',
          isDefault: true,
          id: { not: addressId }
        },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: {
        type: type || existingAddress.type,
        firstName: firstName || existingAddress.firstName,
        lastName: lastName || existingAddress.lastName,
        company: company !== undefined ? company : existingAddress.company,
        address1: address1 || existingAddress.address1,
        address2: address2 !== undefined ? address2 : existingAddress.address2,
        city: city || existingAddress.city,
        state: state || existingAddress.state,
        country: country || existingAddress.country,
        postalCode: postalCode || existingAddress.postalCode,
        phone: phone !== undefined ? phone : existingAddress.phone,
        isDefault: isDefault !== undefined ? isDefault : existingAddress.isDefault
      }
    });

    res.json({
      success: true,
      data: address,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/addresses/{id}:
 *   delete:
 *     summary: Delete address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Authentication required
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const addressId = req.params.id;

    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!existingAddress) {
      throw new ApiError('Address not found', 404, 'ADDRESS_NOT_FOUND');
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    res.json({
      success: true,
      data: { message: 'Address deleted successfully' },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/addresses/{id}/default:
 *   post:
 *     summary: Set address as default
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address set as default successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Authentication required
 */
router.post('/:id/default', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const addressId = req.params.id;

    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!existingAddress) {
      throw new ApiError('Address not found', 404, 'ADDRESS_NOT_FOUND');
    }

    // Unset other defaults of the same type
    await prisma.address.updateMany({
      where: {
        userId,
        type: existingAddress.type,
        isDefault: true,
        id: { not: addressId }
      },
      data: { isDefault: false }
    });

    // Set this address as default
    const address = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true }
    });

    res.json({
      success: true,
      data: address,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
