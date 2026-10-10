/**
 * Types and interfaces for the CampusMitra Volunteer Portal.
 * Models tasks, projects, event assignments, and expense claims.
 */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskCategory =
  | 'Baking'
  | 'Supplies'
  | 'Table Staffing'
  | 'Promotion'
  | 'Logistics'
  | 'General';

export interface VolunteerTask {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  dueDateTimeStamp?: string;
  projectName?: string;
  eventId?: string;
  assigneeName: string;
  assigneeEmail?: string;
  isOverdue?: boolean;
}

export interface VolunteerProject {
  id: string;
  name: string;
  description: string;
  coordinatorName: string;
  coordinatorRole: string;
  deadline: string;
  targetFund?: number;
  raisedFund?: number;
  totalTasks: number;
  completedTasks: number;
  myTasksCount: number;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  category: string;
}

export interface VolunteerEventAssignment {
  id: string;
  eventId: string;
  eventTitle: string;
  date: string;
  time: string;
  location: string;
  responsibility: string;
  assignmentStatus: 'CONFIRMED' | 'COMPLETED' | 'STANDBY';
  briefingInstructions: string[];
}

export type ExpenseCategory =
  | 'SUPPLIES'
  | 'FOOD'
  | 'VENUE'
  | 'DECORATION'
  | 'PRINTING'
  | 'EQUIPMENT'
  | 'OTHER';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

export interface VolunteerExpenseClaim {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  receiptNote: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  reviewerNotes?: string;
  reimbursedAt?: string;
  projectName?: string;
}

export interface VolunteerOverviewStats {
  pendingTasksCount: number;
  inProgressTasksCount: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  upcomingEventsCount: number;
  pendingExpenseAmount: number;
  reimbursedExpenseAmount: number;
}
