import { z } from 'zod';

export const CreateMissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  droneId: z.string().cuid('Invalid drone ID format'),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'FAILED', 'ABORTED']).default('PLANNED'),
  plannedStartAt: z.coerce.date().optional().nullable(),
  plannedRoute: z.unknown().optional().nullable(),
  actualRoute: z.unknown().optional().nullable(),
  waypoints: z.unknown().optional().nullable(),
});

export const UpdateMissionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  droneId: z.string().cuid().optional(),
  plannedStartAt: z.coerce.date().optional().nullable(),
  plannedRoute: z.unknown().optional().nullable(),
  actualRoute: z.unknown().optional().nullable(),
  waypoints: z.unknown().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const QueryMissionSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  droneId: z.string().cuid('Invalid drone ID format').optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'FAILED', 'ABORTED']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sortBy: z.enum(['name', 'status', 'plannedStartAt', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const MissionIdParamSchema = z.object({
  id: z.string().cuid('Invalid mission ID format'),
});

export const DroneIdParamSchema = z.object({
  droneId: z.string().cuid('Invalid drone ID format'),
});

export type CreateMissionInput = z.infer<typeof CreateMissionSchema>;
export type UpdateMissionInput = z.infer<typeof UpdateMissionSchema>;
export type QueryMissionInput = z.infer<typeof QueryMissionSchema>;
export type MissionIdParam = z.infer<typeof MissionIdParamSchema>;
export type DroneIdParam = z.infer<typeof DroneIdParamSchema>;