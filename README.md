# Washly - Professional Car Wash & Home Service Booking Platform

<div align="center">

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.4-green.svg)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

A comprehensive, full-stack platform for booking professional car wash and home service packages with an integrated vendor management system and admin dashboard.

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Getting Started](#getting-started) • [Documentation](#documentation)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## About

Washly is a modern, scalable platform that connects customers with professional car wash centers and home service providers. The application features a user-friendly interface for booking services, comprehensive admin tools for business management, and a vendor system for service providers to manage their offerings.

---

## Features

### 🛒 Customer Features
- **Service Booking**: Browse and book car wash and home service packages
- **Center Discovery**: View detailed information about nearby service centers
- **Payment Integration**: Secure credit card processing for bookings
- **Booking History**: Track all previous and upcoming bookings
- **Rating & Reviews**: Rate and review service centers
- **Flexible Scheduling**: Choose from available time slots

### 🏪 Vendor Features
- **Center Management**: Create and manage multiple service centers
- **Inventory Control**: Set pricing and availability for services
- **Booking Management**: View and manage customer bookings
- **Revenue Analytics**: Track earnings and service statistics
- **Request Management**: Handle vendor registration requests

### 👨‍💼 Admin Features
- **Comprehensive Dashboard**: Real-time analytics and metrics
- **User Management**: Manage customers, vendors, and staff
- **Center Oversight**: Monitor all registered service centers
- **Revenue Tracking**: Detailed financial reports and analytics
- **Vendor Requests**: Approve or reject vendor registration applications
- **System Configuration**: Manage packages, pricing, and availability

---

## Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) 18.3
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.6
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [PostCSS](https://postcss.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Routing**: [React Router](https://reactrouter.com/) v6
- **Charts**: [Recharts](https://recharts.org/)
- **Utilities**: 
  - Lucide React (Icons)
  - date-fns (Date handling)
  - Sonner (Notifications)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/) 5.2
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) 9.4
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: [Bcrypt](https://www.npmjs.com/package/bcrypt)
- **Middleware**: CORS, Authentication, Authorization
- **Development**: [Nodemon](https://nodemon.io/)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.0 or higher
- **npm** 10.0 or higher (or yarn/pnpm)
- **MongoDB** 9.4 or higher (local or Atlas)
- **Git** for version control

### Verify Installation
```bash
node --version    # v20.0.0+
npm --version     # 10.0.0+
```

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yehiahesham2938/washly-app.git
cd washly-app
```

### 2. Quick Setup (Automated)
Choose your package manager and run the appropriate script:

**Windows (PowerShell):**
```powershell
.\install-dependencies.ps1
```

**Windows (Command Prompt):**
```cmd
install-dependencies.cmd
```

**macOS/Linux:**
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### 3. Manual Setup

#### Client Installation
```bash
cd client
npm install
```

#### Server Installation
```bash
cd ../server
npm install
```

#### Environment Configuration

Create a `.env` file in the `server` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/washly
# For local MongoDB: mongodb://localhost:27017/washly

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## Getting Started

### 1. Start the Development Server

From the project root, start both client and server (in separate terminals):

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`

### 2. Seed Database (Optional)
To populate the database with sample data:
```bash
cd server
npm run seed
```

### 3. Access the Application
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API**: [http://localhost:5000/api](http://localhost:5000/api)

### Default Credentials (After Seeding)
Check the `server/seed.js` file for demo user credentials.

---

## Project Structure

```
washly-app/
├── client/                          # React Frontend Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── admin/                   # Admin dashboard components
│   │   ├── components/              # Reusable UI components
│   │   ├── contexts/                # React context (Auth, Centers)
│   │   ├── data/                    # Mock data and fixtures
│   │   ├── lib/                     # Utility functions and helpers
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API client services
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx                 # Application entry point
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.ts           # Tailwind CSS config
│   ├── tsconfig.json                # TypeScript configuration
│   └── package.json                 # Frontend dependencies
│
├── server/                          # Node.js/Express Backend
│   ├── config/                      # Database configuration
│   ├── middleware/                  # Express middleware (auth, admin)
│   ├── models/                      # MongoDB schemas and models
│   ├── routes/                      # API route handlers
│   ├── utils/                       # Helper functions
│   ├── server.js                    # Server entry point
│   ├── seed.js                      # Database seeding script
│   └── package.json                 # Backend dependencies
│
├── docs/                            # Documentation
├── LICENSE                          # ISC License
├── README.md                        # This file
└── install-dependencies.*           # Setup scripts
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Users Endpoints
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users` - List all users (Admin only)

### Centers Endpoints
- `GET /centers` - Get all service centers
- `GET /centers/:id` - Get center details
- `POST /centers` - Create new center (Vendor)
- `PUT /centers/:id` - Update center
- `DELETE /centers/:id` - Delete center

### Bookings Endpoints
- `GET /bookings` - Get user's bookings
- `POST /bookings` - Create new booking
- `GET /bookings/:id` - Get booking details
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Home Packages Endpoints
- `GET /homePackages` - Get all home service packages
- `POST /homePackages` - Create package (Vendor)
- `PUT /homePackages/:id` - Update package
- `DELETE /homePackages/:id` - Delete package

### Vendor Requests Endpoints
- `POST /vendorRequests` - Submit vendor registration request
- `GET /vendorRequests` - List requests (Admin only)
- `PUT /vendorRequests/:id` - Approve/reject request (Admin only)

---

## Development

### Build for Production

**Frontend:**
```bash
cd client
npm run build
```
Output: `client/dist/`

**Linting:**
```bash
npm run lint
```

### Testing
```bash
# Coming soon
npm run test
```

### Code Quality
- TypeScript enabled for type safety
- ESLint configured for code standards
- Tailwind CSS for consistent styling

---

## Key Features & Implementation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (User, Vendor, Admin)
- Secure password hashing with Bcrypt
- Protected routes and API endpoints

### Database Models
- **User**: Customer profiles and authentication
- **CarWash**: Service center information
- **HomePackage**: Home service packages
- **Booking**: Reservation records
- **VendorCenterRequest**: Vendor registration applications

### Real-time Features
- Live availability checking
- Dynamic pricing calculation
- Revenue analytics dashboard

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/YourFeature`
3. **Commit** changes: `git commit -m 'Add YourFeature'`
4. **Push** to the branch: `git push origin feature/YourFeature`
5. **Open** a Pull Request

### Coding Standards
- Use TypeScript for type safety
- Follow existing code structure
- Write meaningful commit messages
- Ensure code passes linting

---

## Troubleshooting

### Port Already in Use
If ports 5000 or 5173 are in use, modify the environment variables:
```env
PORT=5001  # Change backend port
```

### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure whitelist IP in MongoDB Atlas

### CORS Errors
- Verify `CORS_ORIGIN` in `.env` matches your frontend URL
- Check that the frontend is making requests to the correct API URL

---

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

---

## Support & Contact

For issues, questions, or suggestions, please:
- Open an [Issue](https://github.com/yehiahesham2938/washly-app/issues)
- Submit a [Pull Request](https://github.com/yehiahesham2938/washly-app/pulls)

---

<div align="center">

**Made with ❤️ by [Yehia Hesham](https://github.com/yehiahesham2938)**

**[⬆ Back to top](#washly---professional-car-wash--home-service-booking-platform)**

</div>