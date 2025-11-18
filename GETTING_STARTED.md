# Getting Started with No-Code Admin Panel Builder

This guide will walk you through setting up and using the admin panel builder.

## Step 1: Set Up the Control Plane Database

The control plane database stores metadata about your connections and configurations.

### Option A: Local PostgreSQL

1. Install PostgreSQL if you haven't already
2. Create a new database:
```bash
createdb admin_panel_control
```

3. Update your `.env` file:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/admin_panel_control"
```

### Option B: Cloud Database (Neon, Supabase, etc.)

1. Create a PostgreSQL database on your preferred provider
2. Copy the connection string
3. Update your `.env` file with the connection string

## Step 2: Initialize the Database

Run the following commands to set up the schema:

```bash
# Generate Prisma client
npm run prisma:generate

# Create tables
npm run prisma:push

# (Optional) Seed with sample users
npm run prisma:seed
```

## Step 3: Set Up a Test Database

For this tutorial, we'll create a sample marketplace database:

### Create the test database:
```bash
createdb marketplace_test
```

### Load the sample schema:
```bash
psql marketplace_test < examples/marketplace.sql
```

This creates a full marketplace schema with:
- Vendors
- Products
- Categories
- Customers
- Orders
- Reviews

## Step 4: Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Add Your First Connection

1. Click **"Get Started"** or navigate to **Connections**
2. Click **"Add Connection"**
3. Fill in the form:
   - **Name**: Marketplace Test
   - **Host**: localhost
   - **Port**: 5432
   - **Database**: marketplace_test
   - **Username**: your_username
   - **Password**: your_password
4. Click **"Create Connection"**

The system will test the connection before saving.

## Step 6: Introspect the Database

1. Find your newly created connection
2. Click the **"Introspect"** button
3. Wait for the process to complete

The system will:
- Discover all 7 tables (vendors, products, categories, customers, orders, order_items, reviews)
- Extract column information
- Identify relationships
- Create default configurations
- Generate list, detail, and edit views

## Step 7: Explore Your Admin Panels

After introspection, you'll see entity badges. Click on any entity (e.g., "Products") to:

### List View
- Browse all products
- Sort by any column
- Paginate through results
- Quick actions (view, edit, delete)

### Detail View
- View all fields of a single product
- See related data
- Navigate to edit

### Edit View
- Create new products
- Update existing products
- Smart form fields based on column types
- Validation based on constraints

## Common Workflows

### Managing Products

1. Navigate to **Products** list
2. Click **"Add New"** to create a product
3. Fill in the form:
   - Select a vendor
   - Choose a category
   - Set name, description, price
   - Set stock quantity
4. Click **"Save"**

### Managing Orders

1. Navigate to **Orders** list
2. View order details by clicking the eye icon
3. See customer information, items, totals
4. Update order status via edit form

### Managing Customers

1. Navigate to **Customers** list
2. View customer details
3. See their order history (via related orders)

## Customization Tips

### Show/Hide Fields

1. Use the API or database to update `fieldsJson`
2. Set `visible.list`, `visible.detail`, `visible.edit` to control visibility

### Change Display Names

1. Update `displayName` in entity config
2. Update field `label` for better readability

### Adjust Permissions

1. Edit `permissionsJson` for each entity
2. Control what each role (admin/editor/viewer) can do

## Try Other Examples

### CRM System
```bash
createdb crm_test
psql crm_test < examples/crm.sql
```

Then add a new connection to `crm_test` and introspect!

### Helpdesk System
```bash
createdb helpdesk_test
psql helpdesk_test < examples/helpdesk.sql
```

Then add a new connection to `helpdesk_test` and introspect!

## Production Deployment

### Before Going Live

1. **Add Authentication**: Implement proper user authentication in `middleware.ts`
2. **Secure Credentials**: Use environment variables for all database credentials
3. **Enable HTTPS**: Always use SSL for database connections in production
4. **Set Up Backups**: Regular backups of both control plane and target databases
5. **Review Permissions**: Ensure role-based access is properly configured
6. **Monitor Logs**: Set up logging for security and debugging

### Deployment Options

**Vercel** (Recommended for quick deployment):
```bash
vercel
```

**Docker**:
```bash
docker build -t admin-panel .
docker run -p 3000:3000 -e DATABASE_URL=your_url admin-panel
```

**Traditional VPS**:
```bash
npm run build
npm start
```

## Troubleshooting

### Connection Failed
- Verify database credentials
- Check if database is running
- Ensure firewall allows connections
- Try with SSL enabled/disabled

### Introspection Issues
- Ensure the database user has read permissions
- Check if tables exist in the `public` schema
- Review logs for detailed error messages

### Missing Data in Views
- Verify field visibility settings in entity config
- Check view layout configurations
- Ensure proper permissions for your role

## Next Steps

- Explore the [README](README.md) for advanced features
- Check API documentation for programmatic access
- Customize field types and layouts
- Implement authentication for production use
- Add more databases and entities

Happy building! 🚀
