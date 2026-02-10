# Backend API Documentation - Agri-Sathi Platform

**Base URL:** `/api/user`

---

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Agro-Business Management](#agro-business-management)
4. [Products Management](#products-management)
5. [Orders & Requests](#orders--requests)
6. [Notifications](#notifications)
7. [Farmer Management](#farmer-management)
8. [Crop Management](#crop-management)
9. [Expenses & Income](#expenses--income)
10. [Alerts](#alerts)
11. [Finance & Reports](#finance--reports)
12. [Analytics](#analytics)
13. [Settings](#settings)

---

## 🔐 Authentication

### 1. **Farmer/Agro-Business Login**
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (Success):**
```json
{
  "role": "farmer|agro",
  "_id": "string",
  "name": "string",
  "email": "string",
  ...
}
```

**Response (Error):**
- 400: Email and password are required
- 404: User not found
- 401: Incorrect password

---

## 👤 User Management

### 2. **Register Farmer**
**POST** `/register`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "userType": "farmer"
}
```

**Response:**
- 201: Registration successful
- 400: Email already exists

---

### 3. **Get User by Email**
**POST** `/by-email`

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "userType": "string",
  ...
}
```

---

## 🏪 Agro-Business Management

### 4. **Register Agro-Business** ⬆️ FILE UPLOAD
**POST** `/agro/register`

**Headers:**
- Content-Type: multipart/form-data

**Form Data:**
```
- agroName: string (required)
- ownerName: string (required)
- email: string (required)
- phone: string (required)
- password: string (required)
- city: string (required)
- address: string (required)
- location: string
- agroType: string (required)
- services: string (comma-separated)
- gstNumber: string (required)
- socialLinks: string (comma-separated)
- workingHours: JSON string
- logo: file (multipart)
- idProof: file (multipart)
```

**Response:**
```json
{
  "message": "Agro-Business account created",
  "agro": {
    "_id": "string",
    "agroName": "string",
    "ownerName": "string",
    "email": "string",
    ...
  }
}
```

---

### 5. **Get Agro-Business by ID**
**GET** `/agro/:id`

**Response:**
```json
{
  "_id": "string",
  "agroName": "string",
  "ownerName": "string",
  "email": "string",
  "phone": "string",
  "city": "string",
  "address": "string",
  "location": "object",
  "agroType": "string",
  "services": "array",
  "gstNumber": "string",
  "socialLinks": "array",
  "workingHours": "object",
  "logoPath": "string",
  "idProofPath": "string"
}
```

---

### 6. **Get Agro Dashboard**
**GET** `/agro/dashboard`

**Query Parameters:**
- `id`: string OR `email`: string (at least one required)

**Response:**
```json
{
  "summary": {
    "agroName": "string",
    "agroType": "string",
    "city": "string",
    "workingHours": "object",
    "logoPath": "string",
    "servicesCount": "number"
  },
  "services": ["string"],
  "stats": {
    "products": "number",
    "orders": "number",
    "pendingOrders": "number",
    "revenue": "number",
    "unreadNotifications": "number"
  },
  "recent": {
    "products": ["object"],
    "orders": ["object"],
    "notifications": ["object"]
  }
}
```

---

### 7. **Get Agro Dashboard Metrics Only**
**GET** `/agro/dashboard/metrics`

**Query Parameters:**
- `id`: string OR `email`: string

**Response:**
```json
{
  "products": "number",
  "orders": "number",
  "pendingOrders": "number",
  "revenue": "number"
}
```

---

### 8. **Get Agro Profile**
**GET** `/agro/profile`

**Query Parameters:**
- `id`: string OR `email`: string

**Response:**
```json
{
  "_id": "string",
  "agroName": "string",
  "ownerName": "string",
  "email": "string",
  ...
}
```

---

### 9. **Get Agro Services**
**GET** `/agro/services`

**Query Parameters:**
- `id`: string OR `email`: string

**Response:**
```json
{
  "services": ["string"]
}
```

---

### 10. **Add Service to Agro**
**POST** `/agro/services`

**Request Body:**
```json
{
  "id": "string",
  "email": "string",
  "service": "string"
}
```

**Response:**
```json
{
  "message": "Service added",
  "services": ["string"]
}
```

---

### 11. **Get Recent Products**
**GET** `/agro/products/recent`

**Query Parameters:**
- `id` OR `email`: string
- `limit`: number (default: 10)

**Response:**
```json
[
  {
    "_id": "string",
    "ownerId": "string",
    "name": "string",
    "category": "string",
    "price": "number",
    "quantity": "number",
    "discount": "number",
    "description": "string",
    "imagePath": "string",
    "isActive": "boolean",
    "createdAt": "date"
  }
]
```

---

### 12. **Get Recent Orders**
**GET** `/agro/orders/recent`

**Query Parameters:**
- `id` OR `email`: string
- `limit`: number (default: 5)

**Response:**
```json
[
  {
    "_id": "string",
    "productId": "object",
    "farmerId": "object",
    "agroId": "string",
    "quantity": "number",
    "totalPrice": "number",
    "status": "string",
    "createdAt": "date"
  }
]
```

---

### 13. **Get Recent Notifications**
**GET** `/agro/notifications`

**Query Parameters:**
- `id` OR `email`: string
- `limit`: number (default: 5)

**Response:**
```json
[
  {
    "_id": "string",
    "userId": "string",
    "userRole": "string",
    "type": "string",
    "title": "string",
    "body": "string",
    "relatedId": "string",
    "isRead": "boolean",
    "createdAt": "date"
  }
]
```

---

### 14. **Agro Forgot Password**
**POST** `/agro/forgot`

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "message": "Reset token generated",
  "token": "string"
}
```

---

### 15. **Agro Reset Password**
**POST** `/agro/reset`

**Request Body:**
```json
{
  "token": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

---

## 📦 Products Management

### 16. **Create Product** ⬆️ FILE UPLOAD
**POST** `/product`

**Headers:**
- Content-Type: multipart/form-data

**Form Data:**
```
- email: string (required)
- name: string (required)
- category: string (required)
- price: number (required)
- quantity: number (required)
- discount: number (default: 0)
- description: string
- image: file (multipart)
```

**Response:**
```json
{
  "message": "Product created",
  "product": {
    "_id": "string",
    "ownerId": "string",
    "name": "string",
    "category": "string",
    "price": "number",
    "quantity": "number",
    "discount": "number",
    "description": "string",
    "imagePath": "string",
    "isActive": true
  }
}
```

---

### 17. **Get Products**
**GET** `/product`

**Query Parameters:**
- `email`: string (required)

**Response:**
```json
[
  {
    "_id": "string",
    "ownerId": "string",
    "name": "string",
    "category": "string",
    "price": "number",
    "quantity": "number",
    "discount": "number",
    "description": "string",
    "imagePath": "string",
    "isActive": "boolean",
    "createdAt": "date"
  }
]
```

---

### 18. **Update Product** ⬆️ FILE UPLOAD
**PUT** `/product/:id`

**Headers:**
- Content-Type: multipart/form-data

**Form Data:**
```
- email: string (required)
- name: string
- category: string
- price: number
- quantity: number
- discount: number
- description: string
- image: file (optional)
```

**Response:**
```json
{
  "message": "Product updated",
  "product": { ... }
}
```

---

### 19. **Delete Product**
**DELETE** `/product/:id`

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "message": "Product deleted"
}
```

---

### 20. **Get Marketplace Products**
**GET** `/marketplace/products`

**Query Parameters:**
- `category`: string (optional)
- `minPrice`: number (optional)
- `maxPrice`: number (optional)

**Response:**
```json
[
  {
    "_id": "string",
    "ownerId": {
      "_id": "string",
      "agroName": "string",
      "city": "string"
    },
    "name": "string",
    "category": "string",
    "price": "number",
    "quantity": "number",
    "discount": "number",
    "description": "string",
    "imagePath": "string",
    "isActive": "boolean"
  }
]
```

---

## 🛒 Orders & Requests

### 21. **Place Order**
**POST** `/order`

**Request Body:**
```json
{
  "farmerEmail": "string",
  "productId": "string",
  "quantity": "number",
  "deliveryAddress": "string"
}
```

**Response:**
```json
{
  "message": "Order placed successfully",
  "order": {
    "_id": "string",
    "productId": "string",
    "farmerId": "string",
    "agroId": "string",
    "quantity": "number",
    "totalPrice": "number",
    "status": "Placed",
    "paymentStatus": "Pending",
    "farmerName": "string",
    "farmerPhone": "string",
    "farmerEmail": "string",
    "deliveryAddress": "string",
    "createdAt": "date"
  }
}
```

---

### 22. **Send Request/Enquiry**
**POST** `/request`

**Request Body:**
```json
{
  "farmerEmail": "string",
  "productId": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "message": "Request sent successfully",
  "request": {
    "_id": "string",
    "productId": "string",
    "farmerId": "string",
    "agroId": "string",
    "message": "string",
    "status": "Pending",
    "response": null,
    "farmerName": "string",
    "farmerPhone": "string",
    "farmerEmail": "string",
    "createdAt": "date"
  }
}
```

---

### 23. **Get Farmer's Orders**
**GET** `/farmer/orders`

**Query Parameters:**
- `email`: string (required)

**Response:**
```json
[
  {
    "_id": "string",
    "productId": { "name": "string", "category": "string", "price": "number", "imagePath": "string" },
    "agroId": { "agroName": "string", "city": "string" },
    "quantity": "number",
    "totalPrice": "number",
    "status": "string",
    "deliveryAddress": "string",
    "createdAt": "date"
  }
]
```

---

### 24. **Get Agro's Orders**
**GET** `/agro/orders`

**Query Parameters:**
- `email`: string (required)

**Response:**
```json
[
  {
    "_id": "string",
    "productId": { "name": "string", "category": "string", "price": "number", "imagePath": "string" },
    "farmerId": { "name": "string", "phone": "string", "email": "string" },
    "quantity": "number",
    "totalPrice": "number",
    "status": "string",
    "deliveryAddress": "string",
    "createdAt": "date"
  }
]
```

---

### 25. **Get Agro's Requests**
**GET** `/agro/requests`

**Query Parameters:**
- `email`: string (required)

**Response:**
```json
[
  {
    "_id": "string",
    "productId": { "name": "string", "category": "string", "price": "number", "imagePath": "string" },
    "farmerId": { "name": "string", "phone": "string", "email": "string" },
    "message": "string",
    "status": "Pending",
    "response": null,
    "createdAt": "date"
  }
]
```

---

### 26. **Get All Orders**
**GET** `/orders`

**Query Parameters:**
- `email`: string (required)

**Response:**
```json
[
  {
    "_id": "string",
    "productId": "string",
    "farmerId": "string",
    "agroId": "string",
    "quantity": "number",
    "totalPrice": "number",
    "status": "string",
    "createdAt": "date"
  }
]
```

---

### 27. **Update Order Status**
**PATCH** `/order/:id/status`

**Request Body:**
```json
{
  "email": "string",
  "status": "Placed|Accepted|Shipped|Completed|Rejected",
  "paymentStatus": "Pending|Paid|Failed"
}
```

**Response:**
```json
{
  "message": "Order status updated",
  "order": { ... }
}
```

---

### 28. **Respond to Request**
**PATCH** `/request/:id/respond`

**Request Body:**
```json
{
  "email": "string",
  "response": "string",
  "status": "Responded|Accepted|Rejected"
}
```

**Response:**
```json
{
  "message": "Response sent",
  "request": { ... }
}
```

---

## 🔔 Notifications

### 29. **Get Notifications**
**GET** `/notifications`

**Query Parameters:**
- `email`: string (required)
- `userRole`: "farmer"|"agro" (optional)

**Response:**
```json
[
  {
    "_id": "string",
    "userId": "string",
    "userRole": "string",
    "type": "Order|Request|Other",
    "title": "string",
    "body": "string",
    "relatedId": "string",
    "isRead": "boolean",
    "createdAt": "date"
  }
]
```

---

### 30. **Mark Notification as Read**
**PATCH** `/notifications/:id/read`

**Request Body:**
```json
{
  "email": "string",
  "userRole": "farmer|agro"
}
```

**Response:**
```json
{
  "message": "Notification marked as read",
  "notification": { ... }
}
```

---

### 31. **Delete Notification**
**DELETE** `/notifications/:id`

**Request Body:**
```json
{
  "email": "string",
  "userRole": "farmer|agro"
}
```

**Response:**
```json
{
  "message": "Notification dismissed"
}
```

---

## 👥 Farmer Management

### 32. **Create Person**
**POST** `/person`

**Request Body:**
```json
{
  "email": "string",
  "name": "string",
  "role": "string",
  "photo": "string (URL)"
}
```

**Response:**
```json
{
  "message": "Person created",
  "person": {
    "_id": "string",
    "name": "string",
    "role": "string",
    "photo": "string",
    "created_by": "string"
  }
}
```

---

### 33. **Get People**
**GET** `/person`

**Query Parameters:**
- `email`: string (required)
- `q`: string (search query, optional)

**Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "role": "string",
    "photo": "string",
    "created_by": "string"
  }
]
```

---

### 34. **Get Person's Transactions**
**GET** `/person/:id/transactions`

**Query Parameters:**
- `email`: string (required)

**Response:**
```json
[
  {
    "_id": "string",
    "user": "string",
    "person": "string",
    "type": "income|expense",
    "amount": "number",
    "category": "string",
    "date": "date",
    "description": "string"
  }
]
```

---

## 🌾 Crop Management

### 35. **Create Crop**
**POST** `/crop`

**Request Body:**
```json
{
  "email": "string",
  "name": "string",
  "startDate": "date string",
  "expectedHarvestDate": "date string",
  "plannedBudget": "number"
}
```

**Response:**
```json
{
  "message": "Crop added",
  "crop": {
    "_id": "string",
    "user": "string",
    "name": "string",
    "startDate": "date",
    "expectedHarvestDate": "date",
    "plannedBudget": "number",
    "createdAt": "date"
  }
}
```

---

### 36. **Get Crops**
**GET** `/crop`

**Query Parameters:**
- `email`: string (required)

**Response:**
```json
[
  {
    "_id": "string",
    "user": "string",
    "name": "string",
    "startDate": "date",
    "expectedHarvestDate": "date",
    "plannedBudget": "number",
    "customThreshold": "number (optional)"
  }
]
```

---

### 37. **Get Crop Summary**
**GET** `/crop/summary`

**Query Parameters:**
- `email`: string (required)

**Response:**
```json
{
  "summaries": [
    {
      "name": "string",
      "plannedBudget": "number",
      "totalSpent": "number",
      "remainingBudget": "number"
    }
  ],
  "totals": {
    "plannedBudget": "number",
    "totalSpent": "number",
    "remainingBudget": "number"
  }
}
```

---

### 38. **Get Crop Expenses**
**GET** `/crop/expenses`

**Query Parameters:**
- `email`: string (required)
- `crop`: string (crop name, required)

**Response:**
```json
[
  {
    "_id": "string",
    "user": "string",
    "amount": "number",
    "category": "string",
    "crop": "string",
    "date": "date",
    "note": "string"
  }
]
```

---

### 39. **Set Custom Crop Threshold**
**POST** `/crop/:id/threshold`

**Request Body:**
```json
{
  "email": "string",
  "threshold": "number (percentage)"
}
```

**Response:**
```json
{
  "message": "Custom threshold set",
  "threshold": "number",
  "currentUsage": "number"
}
```

---

## 💰 Expenses & Income

### 40. **Add Expense**
**POST** `/expense`

**Request Body:**
```json
{
  "email": "string",
  "amount": "number",
  "category": "string",
  "crop": "string (optional)",
  "date": "date string (optional)",
  "note": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Expense added successfully",
  "expense": {
    "_id": "string",
    "user": "string",
    "amount": "number",
    "category": "string",
    "crop": "string",
    "date": "date",
    "note": "string"
  }
}
```

---

### 41. **Add Income**
**POST** `/income`

**Request Body:**
```json
{
  "email": "string",
  "amount": "number",
  "category": "string",
  "crop": "string (optional)",
  "date": "date string (optional)",
  "note": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Income added successfully",
  "income": {
    "_id": "string",
    "user": "string",
    "amount": "number",
    "category": "string",
    "crop": "string",
    "date": "date",
    "note": "string"
  }
}
```

---

### 42. **Add Transaction**
**POST** `/transaction`

**Request Body:**
```json
{
  "email": "string",
  "personId": "string",
  "type": "income|expense",
  "amount": "number",
  "category": "string",
  "date": "date string (optional)",
  "description": "string (optional)",
  "crop": "string (optional)",
  "project": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Transaction added",
  "transaction": {
    "_id": "string",
    "user": "string",
    "person": "string",
    "type": "string",
    "amount": "number",
    "category": "string",
    "date": "date",
    "description": "string"
  }
}
```

---

### 43. **Get Transactions**
**GET** `/transactions`

**Query Parameters:**
- `email`: string (required)
- `person_id`: string (optional)
- `month`: "YYYY-MM" (optional)
- `category`: string (optional)
- `crop`: string (optional)

**Response:**
```json
[
  {
    "_id": "string",
    "user": "string",
    "person": "object",
    "type": "income|expense",
    "amount": "number",
    "category": "string",
    "date": "date",
    "description": "string"
  }
]
```

---

### 44. **Get All Transactions**
**POST** `/all-transactions`

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "income": [{ ... }],
  "expenses": [{ ... }]
}
```

---

## ⚠️ Alerts

### 45. **Get Alerts**
**GET** `/alerts`

**Query Parameters:**
- `email`: string (required)
- `unreadOnly`: boolean (optional, default: false)

**Response:**
```json
[
  {
    "_id": "string",
    "user": "string",
    "crop": {
      "_id": "string",
      "name": "string",
      "startDate": "date",
      "expectedHarvestDate": "date"
    },
    "cropName": "string",
    "alertType": "warning|over-budget|custom-threshold",
    "message": "string",
    "budgetUsage": "number",
    "threshold": "number",
    "amount": "number",
    "budget": "number",
    "isRead": "boolean",
    "isDismissed": "boolean",
    "createdAt": "date"
  }
]
```

---

### 46. **Mark Alert as Read**
**PATCH** `/alerts/:id/read`

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "message": "Alert marked as read",
  "alert": { ... }
}
```

---

### 47. **Dismiss Alert**
**PATCH** `/alerts/:id/dismiss`

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "message": "Alert dismissed",
  "alert": { ... }
}
```

---

## 📊 Finance & Reports

### 48. **Get Reports**
**POST** `/reports`

**Request Body:**
```json
{
  "email": "string",
  "filterType": "month|year|custom",
  "selectedMonth": "1-12 (optional)",
  "selectedYear": "YYYY (optional)",
  "startDate": "date string (for custom)",
  "endDate": "date string (for custom)"
}
```

**Response:**
```json
{
  "totalIncome": "number",
  "totalExpenses": "number",
  "netProfit": "number",
  "incomeByCategory": {
    "category": "number"
  },
  "expensesByCategory": {
    "category": "number"
  },
  "incomeByDate": {
    "YYYY-MM-DD": "number"
  },
  "expensesByDate": {
    "YYYY-MM-DD": "number"
  },
  "income": ["object"],
  "expenses": ["object"],
  "dateRange": {
    "start": "date",
    "end": "date"
  },
  "cropSummaries": [
    {
      "name": "string",
      "plannedBudget": "number",
      "totalSpent": "number",
      "remainingBudget": "number"
    }
  ]
}
```

---

## 📈 Analytics

### 49. **Get Analytics (General)**
**GET** `/analytics`

**Query Parameters:**
- `email`: string (required)

**Response:**
```json
{
  "totalProducts": "number",
  "totalOrders": "number",
  "monthlySales": {
    "YYYY-MM": "number"
  },
  "topProducts": [
    {
      "name": "string",
      "sold": "number"
    }
  ]
}
```

---

### 50. **Analytics - Test Endpoint**
**GET** `/agro/analytics/test`

**Query Parameters:**
- `id` OR `email`: string

**Response:**
```json
{
  "message": "Analytics test successful",
  "agroId": "string",
  "agroName": "string",
  "orderCount": "number",
  "productCount": "number",
  "timestamp": "date string"
}
```

---

### 51. **Generate Demo Data for Analytics**
**POST** `/agro/analytics/generate-demo-data`

**Request Body:**
```json
{
  "id": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "message": "Demo data generated successfully",
  "agroId": "string",
  "productsCreated": "number",
  "ordersCreated": "number"
}
```

---

### 52. **Get Monthly Sales Analytics**
**GET** `/agro/analytics/monthly-sales`

**Query Parameters:**
- `id` OR `email`: string
- `dateRange`: "today|thisWeek|thisMonth|last3Months|thisYear|custom" (optional)
- `productType`: string (optional)
- `start`: date string (for custom range)
- `end`: date string (for custom range)

**Response:**
```json
[
  {
    "month": "number",
    "year": "number",
    "revenue": "number",
    "quantity": "number",
    "orders": "number"
  }
]
```

---

### 53. **Get Popular Products Analytics**
**GET** `/agro/analytics/popular-products`

**Query Parameters:**
- `id` OR `email`: string
- `dateRange`: string (optional)
- `productType`: string (optional)

**Response:**
```json
{
  "topProducts": [
    {
      "_id": "string",
      "name": "string",
      "category": "string",
      "imagePath": "string",
      "revenue": "number",
      "quantity": "number",
      "orders": "number"
    }
  ],
  "bottomProducts": [
    { ... }
  ],
  "totalProducts": "number"
}
```

---

### 54. **Get Farmer Connections Analytics**
**GET** `/agro/analytics/farmer-connections`

**Query Parameters:**
- `id` OR `email`: string
- `dateRange`: string (optional)

**Response:**
```json
{
  "summary": {
    "totalFarmers": "number",
    "newThisMonth": "number",
    "totalContacts": "number",
    "totalOrders": "number"
  },
  "regionData": [
    {
      "_id": "string",
      "region": "string",
      "farmerCount": "number",
      "orders": "number",
      "revenue": "number"
    }
  ],
  "growthData": [
    {
      "month": "number",
      "year": "number",
      "totalConnections": "number",
      "orders": "number"
    }
  ]
}
```

---

### 55. **Get Geo-Map Analytics**
**GET** `/agro/analytics/geo-map`

**Query Parameters:**
- `id` OR `email`: string
- `dateRange`: string (optional)
- `productType`: string (optional)

**Response:**
```json
[
  {
    "region": "string",
    "farmerCount": "number",
    "orders": "number",
    "revenue": "number",
    "browsingCount": "number",
    "topProducts": [
      {
        "name": "string",
        "quantity": "number"
      }
    ],
    "potentialRevenue": "number"
  }
]
```

---

### 56. **Export Analytics Data**
**GET** `/agro/analytics/export`

**Query Parameters:**
- `id` OR `email`: string
- `dateRange`: string (optional)
- `productType`: string (optional)
- `format`: "csv|json" (default: csv)

**Response:** CSV file or JSON object with all analytics data

---

### 57. **Export Monthly Sales**
**GET** `/agro/analytics/monthly-sales/export`

**Query Parameters:**
- `id` OR `email`: string
- `dateRange`: string (optional)
- `format`: "csv|json"

---

### 58. **Export Popular Products**
**GET** `/agro/analytics/popular-products/export`

**Query Parameters:**
- `id` OR `email`: string
- `dateRange`: string (optional)
- `productType`: string (optional)
- `format`: "csv|json"

---

### 59. **Export Farmer Connections**
**GET** `/agro/analytics/farmer-connections/export`

**Query Parameters:**
- `id` OR `email`: string
- `dateRange`: string (optional)
- `format`: "csv|json"

---

### 60. **Export Geo-Map Data**
**GET** `/agro/analytics/geo-map/export`

**Query Parameters:**
- `id` OR `email`: string
- `dateRange`: string (optional)
- `productType`: string (optional)
- `format`: "csv|json"

---

## ⚙️ Settings

### 61. **Get Settings**
**GET** `/settings`

**Query Parameters:**
- `email`: string (required)

**Response:**
```json
{
  "_id": "string",
  "user": "string",
  "profile": { ... },
  "theme": { ... },
  "notifications": { ... },
  "security": { ... },
  "preferences": { ... },
  "account": { ... },
  "agricultural": { ... }
}
```

---

### 62. **Update Settings**
**PUT** `/settings`

**Request Body:**
```json
{
  "email": "string",
  ...settingsData
}
```

**Response:**
```json
{
  "message": "Settings updated successfully",
  "settings": { ... }
}
```

---

### 63. **Update Profile Settings**
**PUT** `/settings/profile`

**Request Body:**
```json
{
  "email": "string",
  ...profileData
}
```

---

### 64. **Update Theme Settings**
**PUT** `/settings/theme`

**Request Body:**
```json
{
  "email": "string",
  ...themeData
}
```

---

### 65. **Update Notification Settings**
**PUT** `/settings/notifications`

**Request Body:**
```json
{
  "email": "string",
  ...notificationData
}
```

---

### 66. **Update Security Settings**
**PUT** `/settings/security`

**Request Body:**
```json
{
  "email": "string",
  ...securityData
}
```

---

### 67. **Update Preferences**
**PUT** `/settings/preferences`

**Request Body:**
```json
{
  "email": "string",
  ...preferenceData
}
```

---

### 68. **Update Account Settings**
**PUT** `/settings/account`

**Request Body:**
```json
{
  "email": "string",
  ...accountData
}
```

---

### 69. **Update Agricultural Settings**
**PUT** `/settings/agricultural`

**Request Body:**
```json
{
  "email": "string",
  "alertPrefs": { ... },
  ...agriculturalData
}
```

---

## 📝 Common Error Responses

### 400 - Bad Request
```json
{
  "message": "Missing required fields"
}
```

### 401 - Unauthorized
```json
{
  "message": "Incorrect password"
}
```

### 404 - Not Found
```json
{
  "message": "User/Resource not found"
}
```

### 500 - Server Error
```json
{
  "message": "Error message details"
}
```

---

## 📌 API Base Configuration

- **Base URL:** `http://localhost:5000/api/user` (Development)
- **Server Port:** 5000
- **Database:** MongoDB
- **File Upload Directory:** `/uploads`

---

## 🔄 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication failed |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal server error |

---

## 📂 Supported File Types

- **Images:** jpg, jpeg, png, gif
- **Documents:** pdf, doc, docx
- **Max Size:** 50MB (configured in server)

---

**Last Updated:** February 3, 2026
