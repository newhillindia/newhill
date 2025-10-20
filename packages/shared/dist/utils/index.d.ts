export declare const formatCurrency: (amount: number, currency?: string) => string;
export declare const formatDate: (date: string | Date, formatString?: string) => string;
export declare const generateId: () => string;
export declare const slugify: (text: string) => string;
export declare const validateEmail: (email: string) => boolean;
export declare const sleep: (ms: number) => Promise<void>;
