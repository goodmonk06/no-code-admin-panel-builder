# No-Code Admin Panel Builder

> Auto-generate beautiful, type-safe CRUD admin panels for any PostgreSQL database with zero code.

## Overview

The No-Code Admin Panel Builder is a full-stack Next.js application that automatically generates admin interfaces for PostgreSQL databases. Simply connect your database, run introspection, and instantly get fully-functional admin panels with list, detail, and edit views.

**Key capabilities:**
- 🔍 **Automatic Schema Introspection** - Discover tables, columns, relationships, and constraints
- 🎨 **Dynamic UI Generation** - Instant CRUD interfaces with smart, type-aware form fields
- 🔐 **Role-Based Access Control** - Admin, Editor, and Viewer roles with granular permissions
- ⚡ **Type-Safe API** - End-to-end TypeScript with Zod validation
- 🐳 **Docker Ready** - Full Docker Compose setup for local and production deployment

Perfect for:
- **Internal tools** - Quickly build admin panels for any application
- **Database management** - Visual interface for PostgreSQL databases
- **Rapid prototyping** - Test database schemas with instant UIs
- **Outsourced admin** - Centralize admin UIs for multiple services

## Tech Stack

### Core Framework
- **Next.js 14** - React framework with App Router and API Routes
- **TypeScript** - Full type safety across frontend and backend
- **Tailwind CSS** - Utility-first styling

### Database & ORM
- **Prisma** - Type-safe ORM for control plane database
- **PostgreSQL** - Primary database (control plane + target databases)
- **pg** - Direct PostgreSQL driver for dynamic target database queries

### Validation & Testing
- **Zod** - Runtime type validation for API requests
- **Vitest** - Fast unit testing framework with coverage

### Deployment
- **Docker** - Containerization with multi-stage builds
- **Docker Compose** - Local development and production orchestration

## Domain Model

### Control Plane Entities

The control plane stores metadata about connections and configurations:

```
User
├─ email (unique)
├─ name
└─ role (admin | editor | viewer)

Connection
├─ name
├─ type (postgres)
├─ configJson (host, port, database, credentials)
└─ entities → EntityConfig[]

EntityConfig
├─ connectionId → Connection
├─ tableName (actual table in target DB)
├─ displayName (human-readable)
├─ fieldsJson (array of field configurations)
├─ permissionsJson (role-based permissions)
└─ views → ViewConfig[]

ViewConfig
├─ entityId → EntityConfig
├─ type (list | detail | edit)
└─ layoutJson (columns, sorting, sections, etc.)
```

### Data Flow

1. **Connection** → Stores target database credentials
2. **Introspection** → Discovers tables and columns from target database
3. **EntityConfig** → Stores metadata about each table
4. **ViewConfig** → Defines how each table is displayed
5. **Dynamic API** → Queries target database based on configurations
6. **Dynamic UI** → Renders views based on EntityConfig and ViewConfig

## Getting Started

### Requirements

- **Node.js** 18+ (with npm, yarn, or pnpm)
- **PostgreSQL** 15+ (for control plane database)
- **Docker** (optional, for containerized deployment)

### Setup Steps

#### 1. Clone and Install

```bash
git clone <your-repo-url>
cd no-code-admin-panel-builder
npm install
```

#### 2. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` and set your control plane database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/admin_panel_control"
```

#### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data (users, sample connection, entities)
npm run db:seed
```

#### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Setup (Alternative)

For a fully containerized setup:

```bash
# Copy environment file
cp .env.example .env

# Start all services (PostgreSQL + App)
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

For development with hot reload:

```bash
docker compose -f docker-compose.dev.yml up
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema without migrations
npm run db:migrate       # Run migrations (recommended for production)
npm run db:seed          # Seed demo data
npm run db:studio        # Open Prisma Studio GUI
npm run db:reset         # Reset database (dangerous!)

# Testing & Quality
npm run test             # Run tests with Vitest
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run lint             # Lint code with ESLint
npm run type-check       # TypeScript type checking
```

## Example Flow (Vertical Slice)

This section demonstrates the complete end-to-end flow using the marketplace example.

### 1. Prepare Target Database

First, create a sample database with the marketplace schema:

```bash
# Create database
createdb marketplace_demo

# Load schema
psql marketplace_demo < examples/marketplace.sql
```

This creates tables for: vendors, products, categories, customers, orders, order_items, and reviews.

### 2. Add Database Connection

Navigate to [http://localhost:3000/connections](http://localhost:3000/connections) and click **"Add Connection"**.

Fill in the form:
- **Name**: My Marketplace
- **Type**: PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: marketplace_demo
- **Username**: your_username
- **Password**: your_password

Click **"Create Connection"**. The system will test the connection before saving.

### 3. Introspect Database

On the connections page, click the **"Introspect"** button for your newly created connection.

The system will:
- Query `information_schema` to discover all tables
- Extract column metadata (types, constraints, nullability)
- Identify primary keys and foreign keys
- Create `EntityConfig` entries for each table
- Generate default `ViewConfig` layouts (list, detail, edit)

You should see a success message: "Found 7 tables."

### 4. Browse Entities

Click on any entity badge (e.g., **"Products"**) to view the list page.

**List View** (`/admin/[entityId]/list`):
- Displays paginated table of all products
- Shows columns: ID, Name, Price, Stock, Active
- Sortable columns
- Action buttons: View (👁️), Edit (✏️), Delete (🗑️)

### 5. View Details

Click the **eye icon** (👁️) on any product row.

**Detail View** (`/admin/[entityId]/detail/[rowId]`):
- Shows all fields in a clean, labeled layout
- Displays related data
- "Edit" button in header

### 6. Create/Edit Records

Click **"Add New"** or the **edit icon** (✏️).

**Edit View** (`/admin/[entityId]/edit/[rowId]`):
- Smart form fields based on column types:
  - Text inputs for strings
  - Number inputs for integers/decimals
  - Checkboxes for booleans
  - Date pickers for dates
  - JSON editor for JSON columns
- Required field validation
- Save/Cancel buttons

### 7. API Access

All operations are available via REST API:

```bash
# List products with pagination
curl "http://localhost:3000/api/entities/{entityId}/data?page=1&pageSize=20"

# Get single product
curl "http://localhost:3000/api/entities/{entityId}/data/{id}"

# Create product
curl -X POST "http://localhost:3000/api/entities/{entityId}/data" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Product", "price": 29.99, "stock": 100}'

# Update product
curl -X PATCH "http://localhost:3000/api/entities/{entityId}/data/{id}" \
  -H "Content-Type: application/json" \
  -d '{"price": 24.99}'

# Delete product
curl -X DELETE "http://localhost:3000/api/entities/{entityId}/data/{id}"
```

### Complete Vertical Slice Summary

✅ **Database Connection** → Added and tested
✅ **Schema Introspection** → Discovered 7 tables with full metadata
✅ **Entity Configuration** → Auto-generated field configs and permissions
✅ **List View** → Browse products with pagination
✅ **Detail View** → View complete product information
✅ **Edit View** → Create and update products with type-safe forms
✅ **API** → Full REST API for all CRUD operations
✅ **Validation** → Zod schemas protect all endpoints
✅ **Error Handling** → Consistent error responses with codes

## Demo Credentials

After running `npm run db:seed`, you'll have these users:

- **Admin**: `admin@example.com` (full access)
- **Editor**: `editor@example.com` (no delete permission)
- **Viewer**: `viewer@example.com` (read-only)

**Note**: Authentication is currently a stub. Implement proper auth before production use.

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

**Test coverage includes:**
- ✅ Validation schemas (Zod)
- ✅ API error handling
- ✅ Introspection helpers
- ✅ Permission system

## Architecture

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

**Key design decisions:**
- **Two-database pattern**: Control plane (Prisma) + dynamic target databases (raw SQL)
- **Configuration as JSON**: Flexible metadata storage without schema changes
- **Dynamic rendering**: Component registry for type-aware field rendering
- **API-first design**: All features accessible via REST API

## Future Extensions

### High Priority
- [ ] **MySQL Support** - Add MySQL introspector and type mappings
- [ ] **Authentication** - Implement JWT/OAuth with proper session management
- [ ] **Credential Encryption** - Encrypt database credentials at rest
- [ ] **Advanced Filtering** - Search, multi-column filters, date ranges
- [ ] **Bulk Operations** - Select multiple rows, bulk delete/update
- [ ] **Data Export** - Export to CSV, Excel, JSON

### Medium Priority
- [ ] **MongoDB Support** - NoSQL database introspection
- [ ] **Relationship Visualization** - Display foreign key relationships
- [ ] **Custom Field Renderers** - Plugin system for custom field types
- [ ] **Theme Customization** - Dark mode, custom color schemes
- [ ] **Multi-language** - i18n support
- [ ] **API Documentation** - Auto-generated OpenAPI/Swagger docs

### Nice to Have
- [ ] **File Upload** - Handle file/image fields with S3 integration
- [ ] **Rich Text Editor** - WYSIWYG for text fields
- [ ] **Charts & Analytics** - Dashboard with data visualization
- [ ] **Webhooks** - Trigger external services on data changes
- [ ] **Audit Logs** - Track all data modifications
- [ ] **GraphQL API** - Alternative to REST
- [ ] **Backup/Restore** - Database backup and restore via UI
- [ ] **CLI Tool** - Command-line interface for management

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Questions or issues?** Open an issue on GitHub or check the [documentation](GETTING_STARTED.md).

Built with ❤️ using Next.js, Prisma, and TypeScript.
