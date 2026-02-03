# AgriBudget Marketplace Features

## Overview
This document outlines the complete product transaction workflow implemented for AgriBudget, allowing Agro-Business users to list products/services and Farmers to browse, purchase, or send enquiries.

## 🗃️ Database Schema

### Updated Models

#### Product Model
- `ownerId`: Reference to AgroBusiness
- `name`: Product name
- `category`: Enum ['Seed', 'Fertilizer', 'Machinery', 'Other']
- `price`: Price per unit
- `quantity`: Available quantity
- `discount`: Discount percentage (optional)
- `description`: Product description
- `imagePath`: Product image URL
- `isActive`: Product availability status

#### Order Model
- `productId`: Reference to Product
- `farmerId`: Reference to User (farmer)
- `agroId`: Reference to AgroBusiness
- `quantity`: Order quantity
- `totalPrice`: Total amount after discount
- `status`: Enum ['Placed', 'Accepted', 'Shipped', 'Completed', 'Rejected']
- `paymentStatus`: Enum ['Pending', 'Paid']
- `invoicePath`: Invoice file path (optional)
- `farmerName`, `farmerPhone`, `farmerEmail`: Farmer contact info
- `deliveryAddress`: Delivery address

#### Request Model
- `productId`: Reference to Product
- `farmerId`: Reference to User (farmer)
- `agroId`: Reference to AgroBusiness
- `message`: Farmer's enquiry message
- `status`: Enum ['Pending', 'Responded', 'Rejected']
- `response`: Agro's response (optional)
- `farmerName`, `farmerPhone`, `farmerEmail`: Farmer contact info

#### Notification Model
- `userId`: Reference to User/AgroBusiness
- `userRole`: Enum ['farmer', 'agro']
- `type`: Enum ['Order', 'Request', 'Message', 'System']
- `title`: Notification title
- `body`: Notification message
- `isRead`: Read status
- `relatedId`: Reference to related Order/Request

## 🔐 API Endpoints

### Product Management
- `POST /api/user/product` - Add product (with image upload)
- `GET /api/user/product` - Get agro's products
- `PUT /api/user/product/:id` - Update product
- `DELETE /api/user/product/:id` - Delete product

### Marketplace
- `GET /api/user/marketplace/products` - Get all active products (with filters)

### Orders
- `POST /api/user/order` - Place order
- `GET /api/user/farmer/orders` - Get farmer's orders
- `GET /api/user/agro/orders` - Get agro's orders
- `PATCH /api/user/order/:id/status` - Update order status

### Requests/Enquiries
- `POST /api/user/request` - Send enquiry
- `GET /api/user/agro/requests` - Get agro's requests
- `PATCH /api/user/request/:id/respond` - Respond to request

### Notifications
- `GET /api/user/notifications` - Get user notifications
- `PATCH /api/user/notifications/:id/read` - Mark notification as read

## 🎨 Frontend Components

### Agro Dashboard (`AgroDashboard.js`)
- **Dashboard Overview**: Stats, recent products, orders, notifications
- **My Products**: Add, edit, delete products with image upload
- **Orders**: View and manage incoming orders with status updates
- **Requests**: View and respond to farmer enquiries
- **Notifications**: Real-time notification center

### Marketplace (`Marketplace.js`)
- **Product Browsing**: Grid view with filters (category, price range, search)
- **Product Cards**: Image, name, seller info, price, discount, stock
- **Buy Now Flow**: Quantity selection, address input, order placement
- **Send Request Flow**: Message input for enquiries

### My Orders (`MyOrders.js`)
- **Order History**: Complete order tracking with status
- **Order Details**: Product info, seller contact, delivery address
- **Status Filtering**: Filter by order status
- **Order Summary**: Statistics and totals

### Notification Center (`NotificationCenter.js`)
- **Real-time Notifications**: Order updates, request responses
- **Notification Types**: Order, Request, Message, System
- **Mark as Read**: Interactive notification management
- **Responsive Design**: Mobile-friendly dropdown

## 🔄 Workflow

### 1. Agro-Business Product Management
1. Agro logs in to dashboard
2. Navigates to "My Products" tab
3. Adds products with details, pricing, and images
4. Manages product inventory and availability

### 2. Farmer Marketplace Browsing
1. Farmer accesses marketplace
2. Browses products with filters
3. Views product details and seller information
4. Chooses to either "Buy Now" or "Send Request"

### 3. Order Processing
1. **Buy Now Flow**:
   - Select quantity and delivery address
   - Confirm order with total price calculation
   - Order placed with "Placed" status
   - Notification sent to agro business

2. **Agro Order Management**:
   - View incoming orders
   - Accept/Reject orders
   - Update status: Placed → Accepted → Shipped → Completed
   - Notifications sent to farmer on status changes

### 4. Request/Enquiry Flow
1. **Send Request Flow**:
   - Farmer sends enquiry message
   - Request saved with "Pending" status
   - Notification sent to agro business

2. **Agro Request Management**:
   - View incoming requests
   - Respond to enquiries
   - Update status: Pending → Responded/Rejected
   - Notifications sent to farmer

### 5. Order Tracking
1. Farmer views "My Orders" page
2. Tracks order status progression
3. Views order details and seller contact
4. Receives notifications on status updates

## 🎯 Key Features

### For Agro-Business Users
- Complete product management (CRUD operations)
- Image upload for products
- Order management with status tracking
- Request/Enquiry management
- Real-time notifications
- Analytics and reporting

### For Farmers
- Product marketplace with advanced filtering
- Easy order placement with address management
- Enquiry system for product information
- Order tracking and history
- Real-time notifications
- Seller contact information

### System Features
- Real-time notifications
- Status tracking throughout order lifecycle
- Image upload and management
- Responsive design for mobile/desktop
- Secure authentication and authorization
- Database relationships and data integrity

## 🚀 Getting Started

1. **Backend Setup**:
   - Ensure MongoDB is running
   - Install dependencies: `npm install`
   - Start server: `npm start`

2. **Frontend Setup**:
   - Install dependencies: `npm install`
   - Start development server: `npm start`

3. **Testing the Workflow**:
   - Register as Agro-Business user
   - Add products to marketplace
   - Register as Farmer user
   - Browse marketplace and place orders
   - Test order management and notifications

## 📱 Mobile Responsiveness
All components are built with mobile-first design using Tailwind CSS:
- Responsive grid layouts
- Mobile-friendly navigation
- Touch-friendly buttons and interactions
- Optimized modals and dropdowns

## 🔐 Security Features
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure file upload handling
- Protected API endpoints

This implementation provides a complete e-commerce solution for agricultural products with full order management, notification system, and responsive design.
