import { z } from 'zod';

/**
 * Common time range filter schema
 */
const TimeRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

/**
 * Common pagination schema
 */
const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Base dashboard query schema with common filters
 */
export const DashboardQuerySchema = z.object({
  ...TimeRangeSchema.shape,
  ...PaginationSchema.shape,
  droneId: z.string().cuid('Invalid drone ID format').optional(),
  status: z.string().max(50).optional(),
  type: z.string().max(50).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export inferred types
export type DashboardQueryInput = z.infer<typeof DashboardQuerySchema>;