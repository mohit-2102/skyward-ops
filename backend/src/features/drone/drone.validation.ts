import { z } from 'zod';

export const CreateDroneSchema = z.object({
  serialNumber: z.string().min(1, 'Serial number is required').max(50),
  name: z.string().min(1, 'Name is required').max(100),
  model: z.string().min(1, 'Model is required').max(100),
  manufacturerId: z.string().cuid('Invalid manufacturer ID'),
  status: z.enum(['ONLINE', 'OFFLINE', 'IN_FLIGHT', 'CHARGING', 'MAINTENANCE']).default('OFFLINE'),
  firmwareVersion: z.string().max(50).optional(),
  batteryLevel: z.number().int().min(0).max(100).default(100),
  batteryHealth: z.number().int().min(0).max(100).optional(),
  latitude: z.number().min(-90).max(90).default(0),
  longitude: z.number().min(-180).max(180).default(0),
  altitude: z.number().min(0).default(0),
  speed: z.number().min(0).default(0),
  heading: z.number().min(0).max(360).default(0),
  payloadCapacity: z.number().min(0).optional(),
  camera: z.string().max(100).optional(),
  weight: z.number().min(0).optional(),
  maxFlightTime: z.number().int().min(0).optional(),
  maxSpeed: z.number().min(0).optional(),
});

export const UpdateDroneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  manufacturerId: z.string().cuid().optional(),
  status: z.enum(['ONLINE', 'OFFLINE', 'IN_FLIGHT', 'CHARGING', 'MAINTENANCE']).optional(),
  firmwareVersion: z.string().max(50).optional().nullable(),
  batteryLevel: z.number().int().min(0).max(100).optional(),
  batteryHealth: z.number().int().min(0).max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  altitude: z.number().min(0).optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  payloadCapacity: z.number().min(0).optional().nullable(),
  camera: z.string().max(100).optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  maxFlightTime: z.number().int().min(0).optional().nullable(),
  maxSpeed: z.number().min(0).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const QueryDroneSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  status: z.enum(['ONLINE', 'OFFLINE', 'IN_FLIGHT', 'CHARGING', 'MAINTENANCE']).optional(),
  manufacturer: z.string().max(100).optional(),
  sortBy: z.enum(['name', 'batteryLevel', 'status', 'manufacturer', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const DroneIdParamSchema = z.object({
  id: z.string().cuid('Invalid drone ID format'),
});

export type CreateDroneInput = z.infer<typeof CreateDroneSchema>;
export type UpdateDroneInput = z.infer<typeof UpdateDroneSchema>;
export type QueryDroneInput = z.infer<typeof QueryDroneSchema>;
export type DroneIdParam = z.infer<typeof DroneIdParamSchema>;