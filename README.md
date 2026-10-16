# B2B Multi-Vendor Marketplace

A full-stack B2B marketplace platform inspired by Alibaba.com. Connects buyers and suppliers worldwide with product listings, RFQs (inquiries), order management, and real-time messaging.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.io (WebSocket) |
| File Uploads | Multer |
| Frontend | React + Vite |
| Validation | Zod |

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ (LTS recommended)
- [npm](https://www.npmjs.com/) v9+
- [Docker](https://www.docker.com/) (for PostgreSQL)
- [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)

## Project Structure

```
b2b-marketplace/
├── server/                  # Express API
│   ├── prisma/
│   │   └── schema.prisma    # Database models
│   ├── src/
│   │   ├── config/          # Environment config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, upload
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Prisma, JWT, Socket.io
│   │   └── validations/     # Zod schemas
│   ├── uploads/             # Uploaded files
│   └── package.json
├── client/                  # React + Vite SPA
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # Shared components
│   │   ├── context/         # Auth context
│   │   └── pages/           # Page components
│   └── package.json
├── docker-compose.yml       # PostgreSQL container
└── package.json             # Root workspace
```

## Quick Start (Mac)

### 1. Clone and Install

```bash
cd /Users/talha/Documents/Default\ Project/b2b-marketplace
npm install
```

### 2. Start PostgreSQL with Docker

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container on port 5432.

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work for local development):

```env
PORT=5000
DATABASE_URL="postgresql://b2b_user:b2b_password@localhost:5432/b2b_marketplace?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_REFRESH_EXPIRES_IN=30d
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Database Migrations

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations (creates tables)
```

Optional: Open Prisma Studio to browse data:

```bash
npm run db:studio
```

### 5. Start Development Servers

```bash
npm run dev
```

This starts both:
- **API Server**: http://localhost:5000
- **React Client**: http://localhost:3000

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account (BUYER or SUPPLIER) |
| POST | `/login` | Login, returns JWT tokens |
| POST | `/refresh` | Refresh access token |
| GET | `/me` | Get current user profile |

### Products (`/api/products`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List products (paginated, filterable) |
| GET | `/:id` | Public | Product detail |
| GET | `/supplier/:supplierId` | Public | Products by supplier |
| POST | `/` | Supplier/Admin | Create product |
| PUT | `/:id` | Owner/Admin | Update product |
| DELETE | `/:id` | Owner/Admin | Delete product |

### Categories (`/api/categories`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List all (tree structure) |
| GET | `/:id` | Public | Category detail |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

### Search (`/api/search`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Full-text search with filters |
| GET | `/filters` | Available filter options |

### Inquiries / RFQs (`/api/inquiries`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Authenticated | List inquiries |
| POST | `/` | Buyer | Send RFQ |
| GET | `/:id` | Authenticated | Inquiry detail |
| PUT | `/:id/status` | Supplier/Admin | Accept/Reject/Expire |

### Orders (`/api/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Authenticated | List orders |
| POST | `/` | Buyer | Create order from accepted inquiry |
| GET | `/:id` | Authenticated | Order detail + messages |
| PUT | `/:id/status` | Supplier/Admin | Update order status |

### Messages (`/api/messages`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/order/:orderId` | Authenticated | Get order messages |
| POST | `/` | Authenticated | Send message |
| POST | `/order/:orderId/read` | Authenticated | Mark as read |

### User Management (`/api/users`) — Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List users |
| GET | `/:id` | User detail |
| PUT | `/:id/verify` | Verify supplier |
| PUT | `/:id/unverify` | Remove verification |
| PUT | `/:id/role` | Change role |
| DELETE | `/:id` | Delete user |

### Analytics (`/api/analytics`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | Admin | Platform stats |
| GET | `/supplier` | Supplier | Supplier analytics |
| GET | `/buyer` | Buyer | Buyer analytics |

### File Upload (`/api/upload`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/images` | Supplier/Admin | Upload product images (max 10) |
| POST | `/avatar` | Authenticated | Upload avatar |

## WebSocket Events

Connect to `ws://localhost:5000` with JWT token:

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' },
});

// Join an order room to receive messages
socket.emit('join_order', 'order-id');

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Listen for typing indicators
socket.on('typing', ({ userId, isTyping }) => {
  console.log(`User ${userId} is ${isTyping ? 'typing' : 'stopped'}`);
});

// Send typing indicator
socket.emit('typing', { orderId: 'order-id', isTyping: true });
```

### Client Events (emit)
| Event | Payload | Description |
|-------|---------|-------------|
| `join_order` | `orderId` | Join order room |
| `leave_order` | `orderId` | Leave order room |
| `typing` | `{ orderId, isTyping }` | Typing indicator |

### Server Events (listen)
| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | Message object | New message in order |
| `new_message_notification` | `{ orderId, message } | Notification for other party |
| `typing` | `{ userId, isTyping }` | Typing indicator |
| `messages_read` | `{ orderId, readBy }` | Messages marked as read |

## Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
   ↓          ↓           ↓          ↓
CANCELLED  CANCELLED   CANCELLED   DISPUTED
```

## Database Models

- **User** — Buyers, Suppliers, Admins
- **Category** — Hierarchical product categories
- **Product** — Supplier product listings
- **Inquiry** — RFQs from buyers to suppliers
- **Order** — Purchase orders
- **Message** — Order-related conversations

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both server + client |
| `npm run dev:server` | Start API only |
| `npm run dev:client` | Start client only |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run build` | Build client for production |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | API server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | Access token secret |
| `JWT_EXPIRES_IN` | `7d` | Access token expiry |
| `JWT_REFRESH_SECRET` | — | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token expiry |
| `VITE_API_URL` | `http://localhost:5000/api` | Client API base URL |

## License

MIT
