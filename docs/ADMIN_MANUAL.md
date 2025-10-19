# 👨‍💼 Newhill Spices Platform - Admin Manual

## 📋 Table of Contents
1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [Getting Started](#getting-started)
3. [Product Management](#product-management)
4. [Order Management](#order-management)
5. [Customer Management](#customer-management)
6. [Analytics & Reports](#analytics--reports)
7. [B2B Management](#b2b-management)
8. [Content Management](#content-management)
9. [Feature Flags](#feature-flags)
10. [System Settings](#system-settings)

## 🎯 Admin Dashboard Overview

The Newhill Spices Admin Dashboard provides comprehensive management tools for:
- **Product Catalog**: Add, edit, and manage spice products
- **Order Processing**: Track and fulfill customer orders
- **Customer Support**: Manage B2C and B2B customers
- **Analytics**: Monitor sales, performance, and user behavior
- **Content Management**: Update website content and policies
- **Feature Control**: Enable/disable platform features

### Access Levels
- **Super Admin**: Full system access
- **Admin**: Product and order management
- **Manager**: Limited order and customer management
- **Support**: Customer support and basic order management

## 🚀 Getting Started

### Login Process
1. Navigate to `/admin/login`
2. Enter your admin credentials
3. Complete 2FA verification (if enabled)
4. Access the dashboard

### Dashboard Layout
- **Top Navigation**: Quick access to main sections
- **Sidebar**: Detailed navigation menu
- **Main Content**: Current section content
- **Notifications**: System alerts and updates

### Quick Actions
- **New Product**: Add a new spice product
- **Process Orders**: Review pending orders
- **Customer Support**: Handle customer inquiries
- **View Analytics**: Check performance metrics

## 📦 Product Management

### Adding New Products

#### Basic Information
1. Navigate to **Products** → **Add New Product**
2. Fill in required fields:
   - **Product Name** (English, Hindi, Arabic)
   - **Description** (Multi-language)
   - **Category** (Spices, Herbs, Blends)
   - **SKU** (Unique product code)
   - **Price** (Base price in INR)

#### Product Images
1. Upload high-quality product images
2. Set primary image (first image)
3. Add multiple angles/views
4. Ensure images meet requirements:
   - Format: JPG, PNG, WebP
   - Size: Max 5MB per image
   - Dimensions: Min 800x800px

#### Inventory Management
1. Set **Stock Quantity**
2. Configure **Low Stock Alert** (default: 10 units)
3. Set **Out of Stock** threshold
4. Enable **Inventory Tracking**

#### Pricing & Variants
1. Set **Base Price** in INR
2. Add **Regional Pricing**:
   - UAE (AED)
   - Saudi Arabia (SAR)
   - Qatar (QAR)
   - Kuwait (KWD)
   - Bahrain (BHD)
   - Oman (OMR)
3. Configure **Bulk Pricing** for B2B customers
4. Set **Discount Rules**

#### SEO & Marketing
1. **Meta Title**: SEO-optimized title
2. **Meta Description**: Product description for search engines
3. **Keywords**: Relevant search terms
4. **Social Media**: Open Graph images
5. **Featured**: Mark as featured product

### Managing Existing Products

#### Product List View
- **Search**: Find products by name, SKU, or category
- **Filter**: By category, status, stock level
- **Sort**: By name, price, date added, popularity
- **Bulk Actions**: Update status, pricing, or categories

#### Product Details
- **Overview**: Basic information and status
- **Inventory**: Stock levels and alerts
- **Pricing**: Current pricing and variants
- **Analytics**: Views, sales, and performance
- **Reviews**: Customer feedback and ratings

#### Product Status Management
- **Active**: Available for purchase
- **Inactive**: Hidden from customers
- **Discontinued**: No longer available
- **Draft**: Work in progress

## 📋 Order Management

### Order Processing Workflow

#### Order Statuses
1. **Pending**: New order awaiting confirmation
2. **Confirmed**: Order verified and processing
3. **Shipped**: Order dispatched to customer
4. **Delivered**: Order successfully delivered
5. **Cancelled**: Order cancelled (refund if applicable)

#### Processing Orders
1. Navigate to **Orders** → **Pending Orders**
2. Review order details:
   - Customer information
   - Product items and quantities
   - Shipping address
   - Payment status
3. Verify inventory availability
4. Confirm order and update status
5. Generate shipping label
6. Update tracking information

#### Order Details View
- **Customer Info**: Contact details and history
- **Order Items**: Products, quantities, pricing
- **Shipping**: Address and method
- **Payment**: Transaction details
- **Timeline**: Order status history
- **Notes**: Internal notes and customer messages

#### Bulk Order Processing
1. Select multiple orders
2. Choose bulk action:
   - Update status
   - Generate shipping labels
   - Send notifications
   - Export for fulfillment

### Returns & Refunds
1. Navigate to **Orders** → **Returns**
2. Process return requests:
   - Verify return reason
   - Check return policy
   - Approve/deny return
   - Process refund
   - Update inventory

## 👥 Customer Management

### Customer Overview
- **Total Customers**: B2C and B2B count
- **New Customers**: This month
- **Active Customers**: Recent activity
- **Customer Segments**: By region, order value, behavior

### B2C Customer Management
1. Navigate to **Customers** → **B2C Customers**
2. View customer details:
   - Profile information
   - Order history
   - Wishlist items
   - Support tickets
3. Customer actions:
   - Send promotional emails
   - Update customer status
   - Add internal notes
   - View analytics

### B2B Customer Management
1. Navigate to **Customers** → **B2B Customers**
2. Manage B2B accounts:
   - Company information
   - Contact persons
   - Credit limits
   - Bulk pricing
   - Order history
3. B2B-specific features:
   - Quote generation
   - Bulk order processing
   - Credit management
   - Account approval

### Customer Support
1. Navigate to **Support** → **Tickets**
2. Handle customer inquiries:
   - Order issues
   - Product questions
   - Technical support
   - Complaints
3. Support tools:
   - Ticket assignment
   - Priority levels
   - Response templates
   - Escalation rules

## 📊 Analytics & Reports

### Sales Analytics
- **Revenue**: Daily, weekly, monthly trends
- **Order Volume**: Number of orders
- **Average Order Value**: AOV trends
- **Top Products**: Best-selling items
- **Regional Performance**: Sales by region

### Customer Analytics
- **Customer Acquisition**: New customer trends
- **Customer Retention**: Repeat purchase rates
- **Customer Lifetime Value**: CLV analysis
- **Customer Segments**: Behavior analysis
- **Churn Analysis**: Customer loss patterns

### Product Performance
- **Product Views**: Page views and engagement
- **Conversion Rates**: View to purchase
- **Inventory Turnover**: Stock movement
- **Product Reviews**: Rating trends
- **Search Analytics**: Popular search terms

### Marketing Analytics
- **Campaign Performance**: Email and social media
- **Traffic Sources**: Website traffic analysis
- **Conversion Funnels**: User journey analysis
- **A/B Test Results**: Feature testing outcomes

### Report Generation
1. Navigate to **Analytics** → **Reports**
2. Select report type:
   - Sales reports
   - Customer reports
   - Product reports
   - Financial reports
3. Configure parameters:
   - Date range
   - Filters
   - Grouping
   - Format
4. Generate and export reports

## 🏢 B2B Management

### B2B Account Setup
1. Navigate to **B2B** → **Account Applications**
2. Review applications:
   - Company information
   - Business verification
   - Credit references
   - Order requirements
3. Approval process:
   - Verify business details
   - Check creditworthiness
   - Set credit limits
   - Configure pricing
   - Send approval notification

### B2B Pricing Management
1. Navigate to **B2B** → **Pricing Rules**
2. Configure pricing:
   - Volume discounts
   - Customer-specific pricing
   - Regional pricing
   - Seasonal adjustments
3. Pricing tiers:
   - Bronze: 5-10% discount
   - Silver: 10-15% discount
   - Gold: 15-20% discount
   - Platinum: 20%+ discount

### Quote Management
1. Navigate to **B2B** → **Quotes**
2. Create quotes:
   - Select products and quantities
   - Apply B2B pricing
   - Add terms and conditions
   - Set validity period
   - Send to customer
3. Quote tracking:
   - Quote status
   - Follow-up reminders
   - Conversion tracking

### Bulk Order Processing
1. Navigate to **B2B** → **Bulk Orders**
2. Process bulk orders:
   - Verify inventory
   - Apply bulk pricing
   - Schedule fulfillment
   - Coordinate shipping
   - Update tracking

## 📝 Content Management

### Website Content
1. Navigate to **Content** → **Pages**
2. Manage pages:
   - Homepage content
   - About us
   - Contact information
   - FAQ updates
   - Policy pages

### Blog Management
1. Navigate to **Content** → **Blog**
2. Create blog posts:
   - Spice education
   - Recipe content
   - Company news
   - Industry updates
3. SEO optimization:
   - Meta tags
   - Keywords
   - Internal linking

### Email Templates
1. Navigate to **Content** → **Email Templates**
2. Manage templates:
   - Order confirmations
   - Shipping notifications
   - Promotional emails
   - Newsletter content
3. Template customization:
   - Branding elements
   - Personalization
   - Multi-language support

## 🚩 Feature Flags

### Managing Feature Flags
1. Navigate to **Settings** → **Feature Flags**
2. Available flags:
   - **New Features**: Experimental functionality
   - **Regional Features**: Region-specific features
   - **Payment Methods**: Enable/disable payment options
   - **Shipping Options**: Shipping method availability
   - **Multi-language**: Language support toggles
   - **Multi-currency**: Currency support toggles

### Flag Configuration
1. **Boolean Flags**: Simple on/off toggles
2. **Percentage Rollout**: Gradual feature rollout
3. **Region-based**: Enable for specific regions
4. **User Group**: Enable for specific user types
5. **Time-based**: Enable/disable by date range

### Flag Management Process
1. Create new flag
2. Configure conditions
3. Test in staging
4. Gradual rollout
5. Monitor performance
6. Full deployment or rollback

## ⚙️ System Settings

### General Settings
1. Navigate to **Settings** → **General**
2. Configure:
   - Site name and description
   - Contact information
   - Social media links
   - Default currency
   - Default language

### Payment Settings
1. Navigate to **Settings** → **Payments**
2. Configure payment methods:
   - Razorpay (India)
   - Dibsy (UAE)
   - Telr (GCC)
   - Moyasar (Saudi Arabia)
   - Oman Net (Oman)
3. Payment settings:
   - Currency support
   - Transaction fees
   - Refund policies

### Shipping Settings
1. Navigate to **Settings** → **Shipping**
2. Configure shipping:
   - Shipping zones
   - Shipping methods
   - Shipping rates
   - Free shipping thresholds
   - Delivery timeframes

### Email Settings
1. Navigate to **Settings** → **Email**
2. Configure email:
   - SMTP settings
   - Email templates
   - Notification preferences
   - Email automation

### Security Settings
1. Navigate to **Settings** → **Security**
2. Security options:
   - Password policies
   - 2FA requirements
   - Session timeouts
   - IP restrictions
   - Audit logging

## 🔧 Troubleshooting

### Common Issues

#### Product Upload Problems
- **Image Upload Fails**: Check file size and format
- **Pricing Errors**: Verify currency and decimal places
- **Inventory Issues**: Check stock levels and alerts

#### Order Processing Issues
- **Payment Failures**: Verify payment gateway status
- **Shipping Problems**: Check address validation
- **Inventory Conflicts**: Resolve stock discrepancies

#### Customer Support Issues
- **Login Problems**: Check customer credentials
- **Order Status**: Verify order processing workflow
- **Account Issues**: Review customer account status

### Support Resources
- **Internal Wiki**: Detailed troubleshooting guides
- **Technical Support**: Development team contact
- **Vendor Support**: Third-party service support

## 📞 Contact & Support

### Internal Support
- **Admin Support**: admin-support@newhillspices.com
- **Technical Issues**: tech-support@newhillspices.com
- **Emergency**: +91-9876543210

### Training Resources
- **Video Tutorials**: Internal training portal
- **Documentation**: Comprehensive admin guides
- **Best Practices**: Operational guidelines

---

## 🎉 Success Tips

1. **Regular Updates**: Keep product information current
2. **Customer Focus**: Prioritize customer satisfaction
3. **Data Analysis**: Use analytics for decision making
4. **Security First**: Maintain security best practices
5. **Continuous Learning**: Stay updated with platform features

For additional support or training, contact the admin team or refer to the internal documentation portal.

