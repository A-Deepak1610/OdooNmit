import { LucideIcon } from 'lucide-react';
import { UserRole } from '../config/roles';

/**
 * Standard User entity interface matching CampusMitra backend identity schema.
 */
export interface User {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  status?: string;
  roles: UserRole[];
  role?: UserRole;
}

/**
 * Centralized Navigation Item definition.
 */
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  /** Roles permitted to view and access this navigation entry. Empty means public to all authenticated users */
  allowedRoles?: UserRole[];
  /** Optional grouping category for grouping sidebar links */
  group?: string;
}

/**
 * Standard API error structure.
 */
export interface ApiErrorPayload {
  status: 'fail' | 'error';
  statusCode: number;
  message: string;
  requestId?: string;
  timestamp?: string;
  details?: Record<string, unknown>;
}

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  statusCode?: number;
  requestId?: string;
}

/**
 * System Health Response types from backend.
 */
export interface SystemHealthSummary {
  status: 'healthy' | 'degraded' | 'error';
  service: string;
  uptimeSeconds: number;
  timestamp: string;
  checks: {
    process: 'ok' | 'error';
    database: {
      status: 'connected' | 'disconnected';
      latencyMs?: number;
    };
  };
}
