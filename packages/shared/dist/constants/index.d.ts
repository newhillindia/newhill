export declare const API_ENDPOINTS: {
    readonly PRODUCTS: "/api/products";
    readonly USERS: "/api/users";
    readonly ORDERS: "/api/orders";
    readonly HEALTH: "/health";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const USER_ROLES: {
    readonly ADMIN: "admin";
    readonly CUSTOMER: "customer";
};
export declare const ORDER_STATUS: {
    readonly PENDING: "pending";
    readonly PROCESSING: "processing";
    readonly SHIPPED: "shipped";
    readonly DELIVERED: "delivered";
    readonly CANCELLED: "cancelled";
};
export declare const PRODUCT_CATEGORIES: {
    readonly SPICES: "Spices";
    readonly SEASONINGS: "Seasonings";
    readonly HERBS: "Herbs";
    readonly BLENDS: "Blends";
};
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 10;
    readonly MAX_LIMIT: 100;
};
