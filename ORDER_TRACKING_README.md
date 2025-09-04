# Order Tracking System

## Overview
This feature adds a complete order tracking system to the Super Biryani frontend application. Users can now place orders and track their status in real-time.

## Features

### 1. Order Placement
- Orders are automatically saved when placed from the cart
- Each order gets a unique ID and timestamp
- Order status starts as "pending"

### 2. Order Tracking Icon
- A new tracking icon (📊) appears to the left of the cart icon in the navbar
- Shows a notification badge with the count of pending orders
- Clicking it takes users to the order tracking page

### 3. Order Tracking Page (`/orders`)
- Displays all orders with their current status
- Shows order ID, date, customer details, and total amount
- Click "View Details" to see complete order information

### 4. Order Details View
- Complete order breakdown including:
  - Order ID and date
  - Customer billing details
  - List of ordered items with quantities and prices
  - Total amount
  - Current status
- Status update buttons (for admin-like functionality)

### 5. Order Statuses
- **Pending** (🕐): Order is placed but not yet processed
- **Accepted** (✅): Order has been accepted and is being prepared
- **Rejected** (❌): Order has been rejected

## Technical Implementation

### Files Created/Modified
- `src/app/OrderContext.js` - Order state management
- `src/app/orders/page.js` - Order tracking page
- `src/app/Cart.js` - Integrated with order system
- `src/app/Navbar.js` - Added tracking icon
- `src/app/layout.js` - Added OrderProvider

### Context Providers
- **OrderProvider**: Manages order state and localStorage persistence
- **CartProvider**: Manages shopping cart functionality

### Data Persistence
- Orders are stored in localStorage for persistence across browser sessions
- Cart items and order history are maintained separately

## Usage

### For Customers
1. Add items to cart
2. Fill billing details
3. Place order
4. Click the tracking icon (📊) in the navbar
5. View order status and details

### For Admins/Staff
1. Navigate to `/orders`
2. Click "View Details" on any order
3. Use status update buttons to change order status

## Future Enhancements
- Backend integration for real-time updates
- Email/SMS notifications for status changes
- Payment integration
- Delivery tracking
- Order history filtering and search
