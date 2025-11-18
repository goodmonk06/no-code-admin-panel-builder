-- Helpdesk / Support System Database Schema Example
-- This schema demonstrates a typical customer support system

-- Customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  timezone VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Support agents table
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  role VARCHAR(50) DEFAULT 'agent',
  avatar_url VARCHAR(255),
  max_tickets INTEGER DEFAULT 10,
  current_tickets INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ticket categories
CREATE TABLE ticket_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES ticket_categories(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'medium',
  channel VARCHAR(50) DEFAULT 'email',
  tags TEXT[],
  resolution_notes TEXT,
  first_response_at TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ticket comments/replies
CREATE TABLE ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  author_type VARCHAR(50) NOT NULL,
  author_id INTEGER,
  author_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge base articles
CREATE TABLE kb_articles (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES ticket_categories(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SLA (Service Level Agreement) policies
CREATE TABLE sla_policies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  first_response_time INTEGER NOT NULL,
  resolution_time INTEGER NOT NULL,
  business_hours_only BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ticket SLA tracking
CREATE TABLE ticket_sla (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  sla_policy_id INTEGER REFERENCES sla_policies(id),
  first_response_due TIMESTAMP,
  first_response_breached BOOLEAN DEFAULT false,
  resolution_due TIMESTAMP,
  resolution_breached BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data
INSERT INTO customers (name, email, phone, company) VALUES
  ('John Smith', 'john.smith@example.com', '+1-555-0101', 'Tech Corp'),
  ('Sarah Johnson', 'sarah.j@company.com', '+1-555-0102', 'Design Studio'),
  ('Mike Brown', 'mike@startup.io', '+1-555-0103', 'Startup Inc');

INSERT INTO agents (name, email, role) VALUES
  ('Emily Davis', 'emily@support.com', 'senior_agent'),
  ('Tom Wilson', 'tom@support.com', 'agent'),
  ('Lisa Anderson', 'lisa@support.com', 'agent');

INSERT INTO ticket_categories (name, slug) VALUES
  ('Technical Issues', 'technical'),
  ('Billing', 'billing'),
  ('Feature Requests', 'features'),
  ('General Inquiry', 'general');

INSERT INTO tickets (ticket_number, customer_id, assigned_to, category_id, subject, description, status, priority) VALUES
  ('TKT-001', 1, 1, 1, 'Login not working', 'I cannot log in to my account. Getting error 500.', 'open', 'high'),
  ('TKT-002', 2, 2, 2, 'Invoice question', 'Can you send me last month invoice?', 'in_progress', 'low'),
  ('TKT-003', 3, 1, 3, 'Add dark mode', 'Would love to see dark mode in the app!', 'open', 'medium');

INSERT INTO ticket_comments (ticket_id, author_type, author_name, content) VALUES
  (1, 'customer', 'John Smith', 'I cannot log in to my account. Getting error 500.'),
  (1, 'agent', 'Emily Davis', 'Thank you for reporting this. Our team is investigating the issue.'),
  (2, 'customer', 'Sarah Johnson', 'Can you send me last month invoice?'),
  (2, 'agent', 'Tom Wilson', 'I have sent the invoice to your email address.'),
  (3, 'customer', 'Mike Brown', 'Would love to see dark mode in the app!');

INSERT INTO sla_policies (name, priority, first_response_time, resolution_time) VALUES
  ('Critical Priority', 'critical', 60, 240),
  ('High Priority', 'high', 120, 480),
  ('Medium Priority', 'medium', 240, 1440),
  ('Low Priority', 'low', 480, 2880);
