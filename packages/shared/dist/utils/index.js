"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.validateEmail = exports.slugify = exports.generateId = exports.formatDate = exports.formatCurrency = void 0;
const date_fns_1 = require("date-fns");
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatDate = (date, formatString = 'MMM dd, yyyy') => {
    const dateObj = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
    if (!(0, date_fns_1.isValid)(dateObj)) {
        return 'Invalid Date';
    }
    return (0, date_fns_1.format)(dateObj, formatString);
};
exports.formatDate = formatDate;
const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};
exports.generateId = generateId;
const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};
exports.slugify = slugify;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
