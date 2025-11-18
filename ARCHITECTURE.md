# Architecture Overview

This document explains the architecture and design decisions behind the No-Code Admin Panel Builder.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser/Client                       │
│                    (Next.js React App)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/API Calls
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Next.js Server                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes (REST)                                     │ │
│  │  - /api/connections                                    │ │
│  │  - /api/entities                                       │ │
│  │  - /api/entities/:id/data                             │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │  Business Logic Layer                                  │ │
│  │  - Introspection Service                              │ │
│  │  - Permissions System                                 │ │
│  │  - Data Mappers                                       │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌────────────────────┐      ┌────────────────────┐
│  Control Plane DB  │      │   Target DB(s)     │
│   (PostgreSQL)     │      │   (PostgreSQL)     │
│                    │      │                    │
│ - connections      │      │ - users            │
│ - entity_configs   │      │ - products         │
│ - view_configs     │      │ - orders           │
│ - users            │      │ - ...              │
└────────────────────┘      └────────────────────┘
```

## Core Concepts

### 1. Control Plane vs Target Databases

**Control Plane Database**:
- Stores metadata about the admin panel system itself
- Tables: `connections`, `entity_configs`, `view_configs`, `users`
- Managed by Prisma ORM
- Single database for the entire application

**Target Databases**:
- The actual databases you want to manage
- Can be multiple databases
- Connected dynamically at runtime
- Not managed by Prisma (uses raw SQL via `pg` driver)

### 2. Three-Layer Configuration Model

```
Connection
    ↓
EntityConfig
    ↓
ViewConfig
```

**Connection**:
- Represents a database connection
- Stores credentials (encrypted in production)
- Type (postgres, mysql - extensible)

**EntityConfig**:
- Represents a table in the target database
- Stores field configurations (types, labels, visibility)
- Stores permissions by role
- One per table

**ViewConfig**:
- Represents a UI view (list, detail, edit)
- Stores layout configuration (columns, sorting, sections)
- Multiple per entity (one for each view type)

### 3. Introspection Flow

```
1. User adds connection
   └─> System tests connection
       └─> Connection saved

2. User clicks "Introspect"
   └─> Query information_schema
       └─> Discover tables and columns
           └─> Identify PKs and FKs
               └─> Create EntityConfigs
                   └─> Create default ViewConfigs
```

### 4. Data Access Flow

```
User requests data
   └─> API route validates request
       └─> Get EntityConfig from control plane
           └─> Get Connection config
               └─> Create introspector for target DB
                   └─> Execute query on target DB
                       └─> Transform and return data
```

## Directory Structure

```
no-code-admin-panel-builder/
├── app/                          # Next.js app router
│   ├── api/                      # API routes
│   │   ├── connections/          # Connection management
│   │   └── entities/             # Entity and data management
│   ├── admin/[entityId]/         # Dynamic admin pages
│   │   ├── list/                 # List view
│   │   ├── detail/[rowId]/       # Detail view
│   │   └── edit/[rowId]/         # Edit view
│   ├── connections/              # Connection management UI
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   ├── ui/                       # UI primitives
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   └── FieldRenderer.tsx         # Dynamic field rendering
├── lib/                          # Business logic
│   ├── introspection/            # Database introspection
│   │   ├── postgres.ts           # PostgreSQL introspector
│   │   └── index.ts              # Introspection helpers
│   ├── prisma.ts                 # Prisma client
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Utility functions
│   └── permissions.ts            # Permission system
├── prisma/                       # Prisma configuration
│   ├── schema.prisma             # Control plane schema
│   └── seed.ts                   # Seed data
├── examples/                     # Example schemas
│   ├── marketplace.sql
│   ├── crm.sql
│   └── helpdesk.sql
└── middleware.ts                 # Auth middleware (stub)
```

## Key Design Decisions

### 1. Why Next.js?

- **Full-stack**: API routes + React UI in one codebase
- **App Router**: Modern, performant routing
- **Server Components**: Better performance, less JS to client
- **Built-in optimization**: Image optimization, code splitting
- **Easy deployment**: Vercel, Docker, or any Node.js host

### 2. Why Prisma for Control Plane?

- **Type Safety**: Generated types for database models
- **Migrations**: Easy schema evolution
- **Developer Experience**: Great tooling and CLI
- **Not for Target DBs**: Too rigid for dynamic schemas

### 3. Why Raw SQL for Target DBs?

- **Dynamic schemas**: Don't know schema at build time
- **Flexibility**: Can query any table structure
- **No code generation**: Instant connection to new databases
- **Direct control**: Custom queries for specific needs

### 4. Why PostgreSQL?

- **Rich introspection**: Excellent information_schema
- **JSON support**: Store configs as JSONB
- **Robust**: Battle-tested, reliable
- **Extensible**: Easy to add MySQL, SQLite later

### 5. Configuration as JSON

Storing field and layout configs as JSON provides:
- **Flexibility**: No schema changes for new config options
- **Versioning**: Easy to track changes
- **Portability**: Can export/import configs
- **UI-driven**: Can build config editors

## Scalability Considerations

### Current Architecture
- Suitable for: 10-100 connections, 1000s of entities
- Bottleneck: Connection pool management
- Memory: One pool per active connection

### Future Improvements

1. **Connection Pooling**:
   - Implement connection pool manager
   - Reuse pools across requests
   - Close idle connections

2. **Caching**:
   - Cache entity configs (Redis)
   - Cache schema information
   - Invalidate on updates

3. **Background Jobs**:
   - Queue introspection jobs
   - Async bulk operations
   - Scheduled re-introspection

4. **Horizontal Scaling**:
   - Stateless API (easy to scale)
   - Shared session store (Redis)
   - Load balancer compatible

## Security Considerations

### Current Implementation
- ⚠️ **Authentication**: Stub only (implement before production)
- ⚠️ **Authorization**: Role system exists but not enforced
- ✅ **SQL Injection**: Protected (parameterized queries)
- ⚠️ **Credentials**: Stored as JSON (encrypt in production)

### Production Requirements

1. **Authentication**:
   - JWT or session-based auth
   - OAuth integration (Google, GitHub)
   - 2FA for admin users

2. **Encryption**:
   - Encrypt connection credentials at rest
   - Use environment variables for secrets
   - HTTPS only in production

3. **Authorization**:
   - Enforce role-based access in middleware
   - API-level permission checks
   - Audit logging for sensitive operations

4. **Input Validation**:
   - Validate all inputs with Zod
   - Sanitize SQL identifiers
   - Rate limiting on API routes

## Extension Points

### Adding New Database Types

1. Create introspector in `lib/introspection/`
2. Implement interface methods
3. Add to `createIntrospector()` factory
4. Update UI to show new type

### Adding New Field Types

1. Add type to `FieldConfig` interface
2. Update `FieldRenderer` component
3. Add mapping in introspector
4. Update form validation

### Custom Views

1. Add new view type to `ViewConfig`
2. Create page component
3. Add API route if needed
4. Update entity config UI

### Plugins/Extensions

Future: Plugin system for:
- Custom field renderers
- Custom actions/buttons
- Data transformers
- Export formats

## Testing Strategy

### Unit Tests
- Introspection logic
- Permission checks
- Data transformers
- Utility functions

### Integration Tests
- API routes
- Database operations
- Introspection flow

### E2E Tests
- Full user workflows
- Connection → Introspect → CRUD
- Multi-database scenarios

## Performance Optimization

### Current Optimizations
- React Server Components (less JS)
- Tailwind CSS (minimal CSS)
- Pagination (limit data fetching)

### Future Optimizations
- Virtual scrolling for large lists
- Query result caching
- Lazy loading for detail views
- Debounced search/filters
- Image optimization for file fields

## Monitoring & Observability

### Recommended Tools
- **Logs**: Pino, Winston
- **APM**: Datadog, New Relic
- **Errors**: Sentry
- **Metrics**: Prometheus + Grafana

### Key Metrics to Track
- API response times
- Database query times
- Connection pool stats
- Error rates by endpoint
- Active users/connections

---

This architecture is designed to be simple, extensible, and production-ready with minimal additional work.
