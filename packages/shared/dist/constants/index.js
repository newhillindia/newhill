"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGINATION = exports.PRODUCT_CATEGORIES = exports.ORDER_STATUS = exports.USER_ROLES = exports.HTTP_STATUS = exports.API_ENDPOINTS = void 0;
exports.API_ENDPOINTS = {
    PRODUCTS: '/api/products',
    USERS: '/api/users',
    ORDERS: '/api/orders',
    HEALTH: '/health',
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};
exports.USER_ROLES = {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
};
exports.ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};
exports.PRODUCT_CATEGORIES = {
    SPICES: 'Spices',
    SEASONINGS: 'Seasonings',
    HERBS: 'Herbs',
    BLENDS: 'Blends',
};
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
};
