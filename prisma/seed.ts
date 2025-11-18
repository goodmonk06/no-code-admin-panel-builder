import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  console.log('Creating users...')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
  })

  const editor = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      name: 'Editor User',
      role: 'editor',
    },
  })

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      name: 'Viewer User',
      role: 'viewer',
    },
  })

  console.log('✓ Created users:', {
    admin: admin.email,
    editor: editor.email,
    viewer: viewer.email
  })

  // Create demo connection (using localhost as example - won't actually connect)
  console.log('\nCreating demo connection...')
  const demoConnection = await prisma.connection.upsert({
    where: {
      id: 'demo-connection-id'
    },
    update: {},
    create: {
      id: 'demo-connection-id',
      name: 'Demo Marketplace Database',
      type: 'postgres',
      configJson: JSON.stringify({
        host: 'localhost',
        port: 5432,
        database: 'marketplace_demo',
        user: 'demo_user',
        password: 'demo_password',
        ssl: false,
      }),
    },
  })

  console.log('✓ Created connection:', demoConnection.name)

  // Create sample entity configs
  console.log('\nCreating sample entity configs...')

  const productsEntity = await prisma.entityConfig.upsert({
    where: {
      connectionId_tableName: {
        connectionId: demoConnection.id,
        tableName: 'products',
      },
    },
    update: {},
    create: {
      connectionId: demoConnection.id,
      tableName: 'products',
      displayName: 'Products',
      fieldsJson: JSON.stringify([
        {
          name: 'id',
          type: 'number',
          label: 'ID',
          required: true,
          primaryKey: true,
          visible: { list: true, detail: true, edit: false },
          editable: false,
        },
        {
          name: 'name',
          type: 'text',
          label: 'Product Name',
          required: true,
          primaryKey: false,
          visible: { list: true, detail: true, edit: true },
          editable: true,
        },
        {
          name: 'price',
          type: 'number',
          label: 'Price',
          required: true,
          primaryKey: false,
          visible: { list: true, detail: true, edit: true },
          editable: true,
        },
        {
          name: 'stock',
          type: 'number',
          label: 'Stock',
          required: false,
          primaryKey: false,
          visible: { list: true, detail: true, edit: true },
          editable: true,
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'Active',
          required: false,
          primaryKey: false,
          visible: { list: true, detail: true, edit: true },
          editable: true,
        },
        {
          name: 'created_at',
          type: 'datetime',
          label: 'Created At',
          required: false,
          primaryKey: false,
          visible: { list: true, detail: true, edit: false },
          editable: false,
        },
      ]),
      permissionsJson: JSON.stringify({
        admin: { read: true, create: true, update: true, delete: true },
        editor: { read: true, create: true, update: true, delete: false },
        viewer: { read: true, create: false, update: false, delete: false },
      }),
    },
  })

  const ordersEntity = await prisma.entityConfig.upsert({
    where: {
      connectionId_tableName: {
        connectionId: demoConnection.id,
        tableName: 'orders',
      },
    },
    update: {},
    create: {
      connectionId: demoConnection.id,
      tableName: 'orders',
      displayName: 'Orders',
      fieldsJson: JSON.stringify([
        {
          name: 'id',
          type: 'number',
          label: 'ID',
          required: true,
          primaryKey: true,
          visible: { list: true, detail: true, edit: false },
          editable: false,
        },
        {
          name: 'order_number',
          type: 'text',
          label: 'Order Number',
          required: true,
          primaryKey: false,
          visible: { list: true, detail: true, edit: true },
          editable: true,
        },
        {
          name: 'status',
          type: 'text',
          label: 'Status',
          required: true,
          primaryKey: false,
          visible: { list: true, detail: true, edit: true },
          editable: true,
        },
        {
          name: 'total',
          type: 'number',
          label: 'Total Amount',
          required: true,
          primaryKey: false,
          visible: { list: true, detail: true, edit: true },
          editable: true,
        },
        {
          name: 'created_at',
          type: 'datetime',
          label: 'Created At',
          required: false,
          primaryKey: false,
          visible: { list: true, detail: true, edit: false },
          editable: false,
        },
      ]),
      permissionsJson: JSON.stringify({
        admin: { read: true, create: true, update: true, delete: true },
        editor: { read: true, create: true, update: true, delete: false },
        viewer: { read: true, create: false, update: false, delete: false },
      }),
    },
  })

  console.log('✓ Created entities:', {
    products: productsEntity.displayName,
    orders: ordersEntity.displayName,
  })

  // Create view configs for products
  console.log('\nCreating view configs...')

  await prisma.viewConfig.upsert({
    where: {
      entityId_type: {
        entityId: productsEntity.id,
        type: 'list',
      },
    },
    update: {},
    create: {
      entityId: productsEntity.id,
      type: 'list',
      layoutJson: JSON.stringify({
        columns: ['id', 'name', 'price', 'stock', 'active'],
        defaultSort: { field: 'id', order: 'asc' },
        pageSize: 20,
      }),
    },
  })

  await prisma.viewConfig.upsert({
    where: {
      entityId_type: {
        entityId: productsEntity.id,
        type: 'detail',
      },
    },
    update: {},
    create: {
      entityId: productsEntity.id,
      type: 'detail',
      layoutJson: JSON.stringify({
        fields: ['id', 'name', 'price', 'stock', 'active', 'created_at'],
      }),
    },
  })

  await prisma.viewConfig.upsert({
    where: {
      entityId_type: {
        entityId: productsEntity.id,
        type: 'edit',
      },
    },
    update: {},
    create: {
      entityId: productsEntity.id,
      type: 'edit',
      layoutJson: JSON.stringify({
        fields: ['name', 'price', 'stock', 'active'],
      }),
    },
  })

  // Create view configs for orders
  await prisma.viewConfig.upsert({
    where: {
      entityId_type: {
        entityId: ordersEntity.id,
        type: 'list',
      },
    },
    update: {},
    create: {
      entityId: ordersEntity.id,
      type: 'list',
      layoutJson: JSON.stringify({
        columns: ['id', 'order_number', 'status', 'total', 'created_at'],
        defaultSort: { field: 'created_at', order: 'desc' },
        pageSize: 20,
      }),
    },
  })

  await prisma.viewConfig.upsert({
    where: {
      entityId_type: {
        entityId: ordersEntity.id,
        type: 'detail',
      },
    },
    update: {},
    create: {
      entityId: ordersEntity.id,
      type: 'detail',
      layoutJson: JSON.stringify({
        fields: ['id', 'order_number', 'status', 'total', 'created_at'],
      }),
    },
  })

  await prisma.viewConfig.upsert({
    where: {
      entityId_type: {
        entityId: ordersEntity.id,
        type: 'edit',
      },
    },
    update: {},
    create: {
      entityId: ordersEntity.id,
      type: 'edit',
      layoutJson: JSON.stringify({
        fields: ['order_number', 'status', 'total'],
      }),
    },
  })

  console.log('✓ Created view configs for all entities')

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📝 Demo credentials:')
  console.log('   Admin:  admin@example.com')
  console.log('   Editor: editor@example.com')
  console.log('   Viewer: viewer@example.com')
  console.log('\n🔗 Demo connection: "Demo Marketplace Database"')
  console.log('   (Note: This is a placeholder connection for demonstration)')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
