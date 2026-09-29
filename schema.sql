CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('finance', 'operator')),
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operator_name TEXT NOT NULL,
  request_type TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS client_billing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'UNPAID',
  due_date TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_email TEXT,
  status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS supplies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mailroom (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_name TEXT NOT NULL,
  tracking_number TEXT,
  status TEXT DEFAULT 'RECEIVED',
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial records and mock users for roles
INSERT OR IGNORE INTO clients (company_name, api_key) VALUES ('Initial Test Client', 'sk_test_12345');

INSERT OR IGNORE INTO users (name, email, role, api_key) VALUES 
('Alice Operator', 'alice@eaas.com', 'operator', 'sk_op_alice123'),
('Bob Finance', 'bob@eaas.com', 'finance', 'sk_fin_bob123');

INSERT OR IGNORE INTO supplies (item_name, quantity, threshold) VALUES 
('Printer Toner Cartridges', 3, 5),
('A4 Copy Paper Reams', 25, 10),
('Security Badges', 2, 10);

INSERT OR IGNORE INTO vendors (vendor_name, category, contact_email) VALUES 
('Apex Facility Services', 'Maintenance', 'support@apexfacility.com'),
('Global Office Logistics', 'Shipping', 'ops@globaloffice.com');
