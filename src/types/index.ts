// ============================================
// User Types
// ============================================

export type UserRole = 'employee' | 'manager' | 'hr' | 'admin'

export interface User {
  id: string
  company_id: string
  team_id: string | null
  email: string
  full_name: string
  role: UserRole
  hire_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserWithTeam extends User {
  team?: Team
}

// ============================================
// Company Types
// ============================================

export interface Company {
  id: string
  name: string
  domain: string | null
  settings: CompanySettings
  created_at: string
  updated_at: string
}

export interface CompanySettings {
  default_work_days: number[] // 0 = Sunday, 1 = Monday, etc.
  fiscal_year_start_month: number // 1 = January
  require_manager_approval: boolean
  require_hr_approval: boolean
  allow_negative_balance: boolean
  max_days_in_advance: number
}

// ============================================
// Team Types
// ============================================

export interface Team {
  id: string
  company_id: string
  manager_id: string | null
  name: string
  min_staff_required: number
  created_at: string
  updated_at: string
}

export interface TeamWithManager extends Team {
  manager?: User
}

export interface TeamRule {
  id: string
  team_id: string
  max_absent_same_day: number
  blocked_periods: BlockedPeriod[]
}

export interface BlockedPeriod {
  start_date: string
  end_date: string
  reason: string
}

// ============================================
// Leave Types
// ============================================

export interface LeaveType {
  id: string
  company_id: string
  name: string
  code: string
  default_days_per_year: number
  requires_approval: boolean
  requires_justification: boolean
  color: string
  is_active: boolean
  created_at: string
}

// Default leave types for French companies
export const DEFAULT_LEAVE_TYPES = [
  { code: 'CP', name: 'Congés Payés', color: '#6366f1', default_days: 25 },
  { code: 'RTT', name: 'RTT', color: '#10b981', default_days: 10 },
  { code: 'MALADIE', name: 'Arrêt Maladie', color: '#ef4444', default_days: 0 },
  { code: 'SANS_SOLDE', name: 'Sans Solde', color: '#64748b', default_days: 0 },
  { code: 'FAMILLE', name: 'Événement Familial', color: '#f59e0b', default_days: 0 },
  { code: 'FORMATION', name: 'Formation', color: '#3b82f6', default_days: 0 },
] as const

// ============================================
// Leave Request Types
// ============================================

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type HalfDayPeriod = 'morning' | 'afternoon'
export type ApprovalLevel = 'manager' | 'hr'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveRequest {
  id: string
  user_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  is_half_day: boolean
  half_day_period: HalfDayPeriod | null
  days_count: number
  reason: string | null
  status: LeaveRequestStatus
  created_at: string
  updated_at: string
}

export interface LeaveRequestWithDetails extends LeaveRequest {
  user?: User
  leave_type?: LeaveType
  approvals?: RequestApproval[]
}

export interface RequestApproval {
  id: string
  request_id: string
  approver_id: string
  level: ApprovalLevel
  status: ApprovalStatus
  comment: string | null
  decided_at: string | null
  created_at: string
}

export interface RequestApprovalWithApprover extends RequestApproval {
  approver?: User
}

// ============================================
// Leave Balance Types
// ============================================

export interface LeaveBalance {
  id: string
  user_id: string
  leave_type_id: string
  year: number
  initial_balance: number
  used_days: number
  pending_days: number
  remaining_days: number
}

export interface LeaveBalanceWithType extends LeaveBalance {
  leave_type?: LeaveType
}

// ============================================
// Holiday Types
// ============================================

export interface Holiday {
  id: string
  company_id: string
  name: string
  date: string
  is_recurring: boolean
}

// Default French holidays
export const DEFAULT_FRENCH_HOLIDAYS = [
  { name: 'Jour de l\'An', date: '01-01', is_recurring: true },
  { name: 'Lundi de Pâques', date: null, is_recurring: false },
  { name: 'Fête du Travail', date: '05-01', is_recurring: true },
  { name: 'Victoire 1945', date: '05-08', is_recurring: true },
  { name: 'Ascension', date: null, is_recurring: false },
  { name: 'Lundi de Pentecôte', date: null, is_recurring: false },
  { name: 'Fête Nationale', date: '07-14', is_recurring: true },
  { name: 'Assomption', date: '08-15', is_recurring: true },
  { name: 'Toussaint', date: '11-01', is_recurring: true },
  { name: 'Armistice', date: '11-11', is_recurring: true },
  { name: 'Noël', date: '12-25', is_recurring: true },
] as const

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ============================================
// Form Types
// ============================================

export interface LeaveRequestFormData {
  leave_type_id: string
  start_date: string
  end_date: string
  is_half_day: boolean
  half_day_period: HalfDayPeriod | null
  reason: string
}

export interface UserFormData {
  email: string
  full_name: string
  role: UserRole
  team_id: string | null
  hire_date: string
}

// ============================================
// Dashboard Stats Types
// ============================================

export interface DashboardStats {
  pendingRequests: number
  approvedThisMonth: number
  upcomingLeaves: LeaveRequestWithDetails[]
  teamAbsences: TeamAbsence[]
}

export interface TeamAbsence {
  date: string
  users: User[]
  isUnderstaffed: boolean
}

// ============================================
// Calendar Types
// ============================================

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  type: 'leave' | 'holiday'
  status?: LeaveRequestStatus
  userId?: string
  userName?: string
}
