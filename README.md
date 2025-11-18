# No-Code Admin Panel Builder

🚀 Auto-generate beautiful CRUD admin panels for any PostgreSQL database. Connect your database, introspect the schema, and get instant admin interfaces with zero code.

## Features

- ✅ **Automatic Introspection**: Connect to any PostgreSQL database and automatically discover tables and columns
- ✅ **Dynamic UI Generation**: Instantly create list, detail, and edit views for all your tables
- ✅ **Type-Aware Forms**: Smart form fields based on column types (text, number, date, boolean, JSON, etc.)
- ✅ **Role-Based Permissions**: Built-in support for admin, editor, and viewer roles
- ✅ **Fully Customizable**: Edit entity configs, field visibility, and view layouts
- ✅ **Production Ready**: Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database for the control plane
- PostgreSQL database(s) you want to manage

### Installation

1. **Clone and install dependencies**:
```bash
git clone <your-repo>
cd no-code-admin-panel-builder
npm install
```

2. **Set up the control plane database**:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your control plane database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/admin_panel_control"

# Generate Prisma client and push schema
npm run prisma:generate
npm run prisma:push

# (Optional) Seed with sample users
npm run prisma:seed
```

3. **Start the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

### 1. Add a Database Connection

Click "Add Connection" and provide your database credentials:
- **Name**: A friendly name for your connection
- **Host**: Database host (e.g., `localhost`)
- **Port**: Database port (usually `5432` for PostgreSQL)
- **Database**: Name of your database
- **Username & Password**: Your database credentials
- **SSL**: Enable if your database requires SSL

The system will test the connection before saving.

### 2. Introspect Your Database

After adding a connection, click "Introspect" to automatically:
- Discover all tables in your database
- Extract column information (names, types, constraints)
- Identify primary keys and foreign keys
- Create default entity configurations
- Generate list, detail, and edit view layouts

### 3. Manage Your Data

Navigate to any entity to:
- **List View**: Browse all records with pagination and sorting
- **Detail View**: View full details of a single record
- **Edit View**: Create or update records with smart form fields
- **Delete**: Remove records with confirmation

## Architecture

### Control Plane (Metadata Storage)

The control plane uses its own PostgreSQL database to store:
- **Connections**: Database connection configurations
- **EntityConfig**: Table metadata and field configurations
- **ViewConfig**: UI layout configurations for different views
- **Users**: User accounts and role information

### Target Databases

Target databases are the databases you want to manage. The system connects to them dynamically to:
- Introspect schema
- Query data
- Perform CRUD operations

### Tech Stack

- **Frontend + Backend**: Next.js 14 (App Router + API Routes)
- **Database**: Prisma + PostgreSQL
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **Icons**: Lucide React

## Use Cases

### 🛒 Marketplace Admin Panel

Perfect for managing e-commerce platforms:

```sql
-- Example marketplace schema
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**What you get**:
- Vendor management with verification controls
- Product catalog with pricing and inventory
- Order tracking and status updates
- All with zero code!

### 📊 CRM (Customer Relationship Management)

Manage your customer data and sales pipeline:

```sql
-- Example CRM schema
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE deals (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  contact_id INTEGER REFERENCES contacts(id),
  title VARCHAR(255) NOT NULL,
  value DECIMAL(10, 2),
  stage VARCHAR(50) DEFAULT 'prospecting',
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id),
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**What you get**:
- Company directory with industry tracking
- Contact management with relationships
- Deal pipeline with value tracking
- Activity logging and task management

### 🎫 Helpdesk / Support System

Build a customer support platform:

```sql
-- Example helpdesk schema
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  assigned_to INTEGER REFERENCES agents(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id),
  author_type VARCHAR(50) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**What you get**:
- Customer database
- Agent management
- Ticket tracking with status and priority
- Comment threads for conversations

## Outsourcing Admin UIs

One powerful use case is **outsourcing your admin UI** from your main application:

### Why?

- **Separation of Concerns**: Keep admin logic separate from your customer-facing app
- **Faster Development**: Don't spend time building admin panels
- **Shared Admin**: One admin panel can manage multiple databases/services
- **Specialized Teams**: Let your main app team focus on features, not admin UIs

### How?

1. Deploy this admin panel builder as a standalone service
2. Add connections to all your application databases
3. Introspect each database
4. Grant access to your team members

Your main applications can focus on their core functionality while this service handles all admin/backoffice needs.

## Permissions & Security

### Built-in Roles

- **Admin**: Full access (read, create, update, delete)
- **Editor**: Can read, create, and update (no delete)
- **Viewer**: Read-only access

### Customizing Permissions

Edit entity configurations to customize role permissions:

```typescript
{
  "admin": {
    "read": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "editor": {
    "read": true,
    "create": true,
    "update": true,
    "delete": false
  },
  "viewer": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false
  }
}
```

### Authentication (TODO)

The current version includes a permission system stub. For production use, implement:
- JWT-based authentication
- Session management
- OAuth integration
- RBAC (Role-Based Access Control)

Check `middleware.ts` and `lib/permissions.ts` for extension points.

## Customization

### Field Configuration

Each field can be customized:

```typescript
{
  "name": "email",
  "type": "text",
  "label": "Email Address",
  "required": true,
  "primaryKey": false,
  "visible": {
    "list": true,     // Show in list view
    "detail": true,   // Show in detail view
    "edit": true      // Show in edit form
  },
  "editable": true
}
```

### View Layouts

Customize how data is displayed:

**List View**:
```typescript
{
  "columns": ["id", "name", "email", "created_at"],
  "defaultSort": {
    "field": "created_at",
    "order": "desc"
  },
  "pageSize": 20
}
```

**Detail View**:
```typescript
{
  "fields": ["id", "name", "email", "phone", "created_at"],
  "sections": [
    {
      "title": "Basic Information",
      "fields": ["name", "email", "phone"]
    },
    {
      "title": "Metadata",
      "fields": ["id", "created_at", "updated_at"]
    }
  ]
}
```

## API Routes

The system exposes RESTful APIs:

### Connections
- `GET /api/connections` - List all connections
- `POST /api/connections` - Create a connection
- `GET /api/connections/:id` - Get a connection
- `DELETE /api/connections/:id` - Delete a connection
- `POST /api/connections/:id/introspect` - Introspect database

### Entities
- `GET /api/entities` - List all entities
- `GET /api/entities/:id` - Get entity config
- `PATCH /api/entities/:id` - Update entity config

### Data
- `GET /api/entities/:id/data` - Query data (with pagination)
- `POST /api/entities/:id/data` - Create a row
- `GET /api/entities/:id/data/:rowId` - Get a row
- `PATCH /api/entities/:id/data/:rowId` - Update a row
- `DELETE /api/entities/:id/data/:rowId` - Delete a row

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL`: Your control plane database URL

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run prisma:generate
RUN npm run build

CMD ["npm", "start"]
```

### Traditional Hosting

1. Build the project: `npm run build`
2. Start the server: `npm start`
3. Ensure PostgreSQL is accessible

## Roadmap

- [ ] MySQL support
- [ ] MongoDB support
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Data export (CSV, Excel)
- [ ] API key management
- [ ] Audit logs
- [ ] Custom actions/buttons
- [ ] Relationship visualization
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this in your projects!

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Prisma, and TypeScript
