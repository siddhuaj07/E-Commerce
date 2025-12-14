# E-Commerce Store

A full-stack e-commerce website built with Next.js, MongoDB, and Tailwind CSS.

## Features

### User Features
- User authentication (signup, login, logout)
- Product catalog with detailed product pages
- Shopping cart functionality with real-time updates
- Checkout process with shipping information
- Order tracking with status updates
- Profile management with personal information
- Order cancellation (before shipping)

### Admin Features
- Separate admin authentication system
- Admin dashboard with real-time order monitoring
- Order management with status updates
- Product management (add new products)
- User order tracking and management
- Comprehensive admin panel

### Technical Features
- Tab isolation for user sessions
- JWT-based authentication
- Real-time order status updates
- Responsive design with Tailwind CSS
- Error handling and validation
- Clean, human-written code

## Tech Stack

- **Frontend:** Next.js 15.5.2 with React 19.1.0
- **Styling:** Tailwind CSS 3.4.17
- **Backend:** Next.js API Routes (Express.js style)
- **Database:** MongoDB with Mongoose 8.18.1
- **Authentication:** JWT tokens with bcryptjs
- **Runtime:** Node.js

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables: Create a `.env.local` file with:
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser.

## Admin Access

- Navigate to `/admin`
- Use the admin credentials created via the setup script
- Run `node scripts/createMockAdmin.js` to create a test admin

## API Endpoints

### User APIs
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get single product
- `POST /api/auth/signup` - User signup
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/cart` - Add to cart
- `PUT /api/cart` - Update cart
- `DELETE /api/cart` - Remove from cart
- `POST /api/checkout` - Process checkout
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `POST /api/orders/cancel` - Cancel order
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Admin APIs
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/me` - Get admin info
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders` - Update order status
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create new product

## Order Status Flow

1. **Order Placed** - Initial order status
2. **Shipped** - Order has been shipped
3. **Out for Delivery** - Order is out for delivery
4. **Delivered** - Order has been delivered
5. **Cancelled** - Order has been cancelled

## Project Structure

```
├── pages/
│   ├── api/           # API routes
│   ├── admin.js       # Admin dashboard
│   ├── cart.js        # Shopping cart
│   ├── index.js       # Home page with admin dashboard
│   ├── login.js       # User login
│   ├── orders.js      # User orders
│   ├── profile.js     # User profile
│   └── signup.js      # User registration
├── models/            # MongoDB models
├── lib/               # Database connection
├── styles/            # Global styles
└── scripts/           # Setup scripts
```

## Key Features Implemented

- ✅ Complete user authentication system
- ✅ Admin panel with order management
- ✅ Shopping cart with real-time updates
- ✅ Order tracking and status management
- ✅ Product catalog with 8 products
- ✅ Profile management
- ✅ Tab isolation for sessions
- ✅ Responsive design
- ✅ Error handling and validation
- ✅ Clean, production-ready code

## Deployment

This project is ready for deployment on Vercel. Make sure to set up your MongoDB Atlas connection string in the environment variables.

## Recent Updates

- Fixed cancel button logic for delivered orders
- Implemented proper product population in APIs
- Added comprehensive error handling
- Cleaned code to remove comments and empty lines
- Optimized performance and user experience
- Added proper validation and security measures

## About

A complete e-commerce solution built with modern web technologies, featuring both user and admin interfaces with comprehensive order management capabilities.

For Demo - https://e-commerce-rahulrog.vercel.app/
