-- ============================================
-- LeaveFlow - Initial Database Schema
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COMPANIES Table
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  settings JSONB DEFAULT '{
    "default_work_days": [1, 2, 3, 4, 5],
    "fiscal_year_start_month": 1,
    "require_manager_approval": true,
    "require_hr_approval": true,
    "allow_negative_balance": false,
    "max_days_in_advance": 365
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEAMS Table
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  manager_id UUID, -- Will be set after users table is created
  name VARCHAR(255) NOT NULL,
  min_staff_required INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS Table
-- ============================================
CREATE TYPE user_role AS ENUM ('employee', 'manager', 'hr', 'admin');

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'employee',
  hire_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for team manager
ALTER TABLE teams ADD CONSTRAINT fk_teams_manager
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- LEAVE_TYPES Table
-- ============================================
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  default_days_per_year INTEGER DEFAULT 0,
  requires_approval BOOLEAN DEFAULT true,
  requires_justification BOOLEAN DEFAULT false,
  color VARCHAR(7) DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

-- ============================================
-- LEAVE_REQUESTS Table
-- ============================================
CREATE TYPE leave_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE half_day_period AS ENUM ('morning', 'afternoon');

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_half_day BOOLEAN DEFAULT false,
  half_day_period half_day_period,
  days_count DECIMAL(4,1) NOT NULL,
  reason TEXT,
  status leave_request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_half_day CHECK (
    (is_half_day = false AND half_day_period IS NULL) OR
    (is_half_day = true AND half_day_period IS NOT NULL AND start_date = end_date)
  )
);

-- ============================================
-- REQUEST_APPROVALS Table
-- ============================================
CREATE TYPE approval_level AS ENUM ('manager', 'hr');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE request_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  level approval_level NOT NULL,
  status approval_status DEFAULT 'pending',
  comment TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(request_id, level)
);

-- ============================================
-- LEAVE_BALANCES Table
-- ============================================
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  initial_balance DECIMAL(4,1) DEFAULT 0,
  used_days DECIMAL(4,1) DEFAULT 0,
  pending_days DECIMAL(4,1) DEFAULT 0,
  remaining_days DECIMAL(4,1) GENERATED ALWAYS AS (initial_balance - used_days - pending_days) STORED,
  
  UNIQUE(user_id, leave_type_id, year)
);

-- ============================================
-- TEAM_RULES Table
-- ============================================
CREATE TABLE team_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE UNIQUE,
  max_absent_same_day INTEGER DEFAULT 2,
  blocked_periods JSONB DEFAULT '[]'::jsonb
);

-- ============================================
-- HOLIDAYS Table
-- ============================================
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_team ON users(team_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_request_approvals_request ON request_approvals(request_id);
CREATE INDEX idx_leave_balances_user_year ON leave_balances(user_id, year);
CREATE INDEX idx_holidays_company_date ON holidays(company_id, date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update leave balances when request status changes
CREATE OR REPLACE FUNCTION update_leave_balance_on_request_change()
RETURNS TRIGGER AS $$
DECLARE
  v_year INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM COALESCE(NEW.start_date, OLD.start_date));
  
  -- If request is being created as pending
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    UPDATE leave_balances
    SET pending_days = pending_days + NEW.days_count
    WHERE user_id = NEW.user_id 
      AND leave_type_id = NEW.leave_type_id 
      AND year = v_year;
  
  -- If status changed from pending to approved
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'approved' THEN
    UPDATE leave_balances
    SET 
      pending_days = pending_days - NEW.days_count,
      used_days = used_days + NEW.days_count
    WHERE user_id = NEW.user_id 
      AND leave_type_id = NEW.leave_type_id 
      AND year = v_year;
  
  -- If status changed from pending to rejected or cancelled
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('rejected', 'cancelled') THEN
    UPDATE leave_balances
    SET pending_days = pending_days - OLD.days_count
    WHERE user_id = OLD.user_id 
      AND leave_type_id = OLD.leave_type_id 
      AND year = v_year;
  
  -- If approved request is cancelled
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status = 'cancelled' THEN
    UPDATE leave_balances
    SET used_days = used_days - OLD.days_count
    WHERE user_id = OLD.user_id 
      AND leave_type_id = OLD.leave_type_id 
      AND year = v_year;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balance_on_request
  AFTER INSERT OR UPDATE OF status ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_leave_balance_on_request_change();

-- Function to check team understaffing
CREATE OR REPLACE FUNCTION check_team_understaffing(
  p_team_id UUID,
  p_date DATE
)
RETURNS BOOLEAN AS $$
DECLARE
  v_absent_count INTEGER;
  v_min_staff INTEGER;
  v_team_size INTEGER;
  v_max_absent INTEGER;
BEGIN
  -- Get team settings
  SELECT t.min_staff_required, COALESCE(tr.max_absent_same_day, 2)
  INTO v_min_staff, v_max_absent
  FROM teams t
  LEFT JOIN team_rules tr ON tr.team_id = t.id
  WHERE t.id = p_team_id;
  
  -- Count team members
  SELECT COUNT(*) INTO v_team_size
  FROM users WHERE team_id = p_team_id AND is_active = true;
  
  -- Count already approved absences for this date
  SELECT COUNT(DISTINCT lr.user_id) INTO v_absent_count
  FROM leave_requests lr
  JOIN users u ON u.id = lr.user_id
  WHERE u.team_id = p_team_id
    AND lr.status = 'approved'
    AND p_date BETWEEN lr.start_date AND lr.end_date;
  
  -- Check if adding one more absence would cause understaffing
  RETURN (v_team_size - v_absent_count - 1) < v_min_staff 
      OR (v_absent_count + 1) > v_max_absent;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can read other users in same company
CREATE POLICY "Users can view company users"
  ON users FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Users can update own profile (limited)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- HR/Admin can manage users in their company
CREATE POLICY "HR/Admin can manage company users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('hr', 'admin')
        AND company_id = users.company_id
    )
  );

-- Leave requests: users can manage own requests
CREATE POLICY "Users can view own requests"
  ON leave_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own requests"
  ON leave_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending requests"
  ON leave_requests FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- Managers can view team requests
CREATE POLICY "Managers can view team requests"
  ON leave_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN teams t ON t.id = u.team_id
      WHERE u.id = leave_requests.user_id
        AND t.manager_id = auth.uid()
    )
  );

-- HR/Admin can view all requests in company
CREATE POLICY "HR/Admin can view all company requests"
  ON leave_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      JOIN users request_user ON request_user.id = leave_requests.user_id
      WHERE admin_user.id = auth.uid()
        AND admin_user.role IN ('hr', 'admin')
        AND admin_user.company_id = request_user.company_id
    )
  );

-- Leave types: readable by company users
CREATE POLICY "Users can view company leave types"
  ON leave_types FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Admin can manage leave types
CREATE POLICY "Admin can manage leave types"
  ON leave_types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
        AND company_id = leave_types.company_id
    )
  );

-- Leave balances: users can view own
CREATE POLICY "Users can view own balances"
  ON leave_balances FOR SELECT
  USING (user_id = auth.uid());

-- HR/Admin can view/manage all balances in company
CREATE POLICY "HR/Admin can manage company balances"
  ON leave_balances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      JOIN users balance_user ON balance_user.id = leave_balances.user_id
      WHERE admin_user.id = auth.uid()
        AND admin_user.role IN ('hr', 'admin')
        AND admin_user.company_id = balance_user.company_id
    )
  );

-- Holidays: readable by company users
CREATE POLICY "Users can view company holidays"
  ON holidays FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Admin can manage holidays
CREATE POLICY "Admin can manage holidays"
  ON holidays FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
        AND company_id = holidays.company_id
    )
  );

-- ============================================
-- SEED DATA (Optional - for development)
-- ============================================

-- Insert a demo company
-- INSERT INTO companies (name, domain) VALUES ('Demo Company', 'demo.com');

-- Insert default leave types for the demo company
-- INSERT INTO leave_types (company_id, name, code, default_days_per_year, color)
-- SELECT id, 'Congés Payés', 'CP', 25, '#6366f1' FROM companies WHERE domain = 'demo.com'
-- UNION ALL
-- SELECT id, 'RTT', 'RTT', 10, '#10b981' FROM companies WHERE domain = 'demo.com'
-- UNION ALL
-- SELECT id, 'Arrêt Maladie', 'MALADIE', 0, '#ef4444' FROM companies WHERE domain = 'demo.com'
-- UNION ALL
-- SELECT id, 'Sans Solde', 'SANS_SOLDE', 0, '#64748b' FROM companies WHERE domain = 'demo.com';
