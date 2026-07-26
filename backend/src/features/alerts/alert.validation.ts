import { z } from 'zod';

export const CreateAlertSchema = z.object({
  droneId: z.string().cuid('Invalid drone ID format'),
  type: z.enum([
    'LOW_BATTERY',
    'GPS_SIGNAL',
    'COMMUNICATION',
    'SYSTEM',
    'OBSTACLE',
  ]),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  message: z.string().min(1, 'Message is required').max(500),
  metadata: z.unknown().optional().nullable(),
});

export const UpdateAlertSchema = z.object({
  message: z.string().min(1).max(500).optional(),
  metadata: z.unknown().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const QueryAlertSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  droneId: z.string().cuid('Invalid drone ID format').optional(),
  type: z.enum(['LOW_BATTERY', 'GPS_SIGNAL', 'COMMUNICATION', 'SYSTEM', 'OBSTACLE']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'severity', 'status', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const AlertIdParamSchema = z.object({
  id: z.string().cuid('Invalid alert ID format'),
});

export const DroneIdParamSchema = z.object({
  droneId: z.string().cuid('Invalid drone ID format'),
});

export const SeverityParamSchema = z.object({
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

export const TypeParamSchema = z.object({
  type: z.enum(['LOW_BATTERY', 'GPS_SIGNAL', 'COMMUNICATION', 'SYSTEM', 'OBSTACLE']),
});

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;
export type UpdateAlertInput = z.infer<typeof UpdateAlertSchema>;
export type QueryAlertInput = z.infer<typeof QueryAlertSchema>;
export type AlertIdParam = z.infer<typeof AlertIdParamSchema>;
export type DroneIdParam = z.infer<typeof DroneIdParamSchema>;
export type SeverityParam = z.infer<typeof SeverityParamSchema>;
export type TypeParam = z.infer<typeof TypeParamSchema>;