-- CRM (Customer Relationship Management) Database Schema Example
-- This schema demonstrates a typical CRM structure for B2B sales

-- Companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  industry VARCHAR(100),
  employee_count INTEGER,
  annual_revenue DECIMAL(15, 2),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contacts table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  mobile VARCHAR(50),
  position VARCHAR(100),
  department VARCHAR(100),
  decision_maker BOOLEAN DEFAULT false,
  linkedin_url VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deals/Opportunities table
CREATE TABLE deals (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  contact_id INTEGER REFERENCES contacts(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(10, 2),
  stage VARCHAR(50) DEFAULT 'prospecting',
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  lost_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activities table (calls, emails, meetings, tasks)
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  priority VARCHAR(50) DEFAULT 'medium',
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email campaigns table
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'email',
  status VARCHAR(50) DEFAULT 'draft',
  subject VARCHAR(255),
  content TEXT,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data
INSERT INTO companies (name, website, industry, employee_count) VALUES
  ('Acme Corporation', 'https://acme.com', 'Technology', 500),
  ('Global Solutions Ltd', 'https://globalsolutions.com', 'Consulting', 1200),
  ('Startup Inc', 'https://startup.io', 'SaaS', 25);

INSERT INTO contacts (company_id, first_name, last_name, email, position, decision_maker) VALUES
  (1, 'Alice', 'Johnson', 'alice@acme.com', 'CTO', true),
  (1, 'Bob', 'Williams', 'bob@acme.com', 'Engineering Manager', false),
  (2, 'Carol', 'Davis', 'carol@globalsolutions.com', 'CEO', true),
  (3, 'David', 'Miller', 'david@startup.io', 'Founder', true);

INSERT INTO deals (company_id, contact_id, title, value, stage, probability, expected_close_date) VALUES
  (1, 1, 'Enterprise License Deal', 150000.00, 'negotiation', 75, CURRENT_DATE + INTERVAL '30 days'),
  (2, 3, 'Consulting Services Agreement', 250000.00, 'proposal', 50, CURRENT_DATE + INTERVAL '45 days'),
  (3, 4, 'Seed Investment', 500000.00, 'prospecting', 25, CURRENT_DATE + INTERVAL '90 days');

INSERT INTO activities (contact_id, deal_id, type, subject, status, due_date) VALUES
  (1, 1, 'meeting', 'Product Demo', 'scheduled', CURRENT_TIMESTAMP + INTERVAL '3 days'),
  (3, 2, 'call', 'Follow-up Call', 'completed', CURRENT_TIMESTAMP - INTERVAL '2 days'),
  (4, 3, 'email', 'Introduction Email', 'scheduled', CURRENT_TIMESTAMP + INTERVAL '1 day');
