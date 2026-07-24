import { z } from 'zod';

export const CreateMaintenanceSchema = z.object({
  droneId: z.string().cuid('Invalid drone ID format'),
  type: z.enum([
    'ROUTINE',
    'REPAIR',
    'INSPECTION',
    'FIRMWARE_UPDATE',
    'BATTERY_REPLACEMENT',
    'PROPELLER_REPLACEMENT',
    'MOTOR_SERVICE',
    'CALIBRATION',
  ]),
  description: z.string().max(1000).optional().nullable(),
  performedBy: z.string().max(100).optional().nullable(),
  cost: z.number().min(0).max(999999.99).optional().nullable(),
  scheduledAt: z.coerce.date(),
  nextDueAt: z.coerce.date().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const UpdateMaintenanceSchema = z.object({
  type: z.enum([
    'ROUTINE',
    'REPAIR',
    'INSPECTION',
    'FIRMWARE_UPDATE',
    'BATTERY_REPLACEMENT',
    'PROPELLER_REPLACEMENT',
    'MOTOR_SERVICE',
    'CALIBRATION',
  ]).optional(),
  description: z.string().max(1000).optional().nullable(),
  performedBy: z.string().max(100).optional().nullable(),
  cost: z.number().min(0).max(999999.99).optional().nullable(),
  scheduledAt: z.coerce.date().optional().nullable(),
  nextDueAt: z.coerce.date().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const QueryMaintenanceSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  droneId: z.string().cuid('Invalid drone ID format').optional(),
  type: z.enum([
    'ROUTINE',
    'REPAIR',
    'INSPECTION',
    'FIRMWARE_UPDATE',
    'BATTERY_REPLACEMENT',
    'PROPELLER_REPLACEMENT',
    'MOTOR_SERVICE',
    'CALIBRATION',
  ]).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sortBy: z.enum(['scheduledAt', 'completedAt', 'createdAt', 'type', 'status', 'cost']).default('scheduledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const MaintenanceIdParamSchema = z.object({
  id: z.string().cuid('Invalid maintenance ID format'),
});

export const DroneIdParamSchema = z.object({
  droneId: z.string().cuid('Invalid drone ID format'),
});

export type CreateMaintenanceInput = z.infer<typeof CreateMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof UpdateMaintenanceSchema>;
export type QueryMaintenanceInput = z.infer<typeof QueryMaintenanceSchema>;
export type MaintenanceIdParam = z.infer<typeof MaintenanceIdParamSchema>;
export type DroneIdParam = z.infer<typeof DroneIdParamSchema>;