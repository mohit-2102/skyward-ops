import { z } from 'zod';

export const CreateTelemetrySchema = z.object({
  droneId: z.string().cuid('Invalid drone ID format'),
  batteryLevel: z.number().int().min(0, 'Battery level must be at least 0').max(100, 'Battery level must be at most 100'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  altitude: z.number().min(-1000, 'Altitude cannot be below -1000 meters').max(50000, 'Altitude cannot exceed 50000 meters'),
  speed: z.number().min(0, 'Speed cannot be negative').max(1000, 'Speed cannot exceed 1000 km/h'),
  heading: z.number().min(0, 'Heading must be between 0 and 360').max(360, 'Heading must be between 0 and 360'),
  temperature: z.number().min(-100, 'Temperature cannot be below -100°C').max(100, 'Temperature cannot exceed 100°C').optional().nullable(),
  humidity: z.number().int().min(0, 'Humidity must be between 0 and 100').max(100, 'Humidity must be between 0 and 100').optional().nullable(),
  windSpeed: z.number().min(0, 'Wind speed cannot be negative').max(500, 'Wind speed cannot exceed 500 km/h').optional().nullable(),
  signalStrength: z.number().int().min(0, 'Signal strength must be between 0 and 100').max(100, 'Signal strength must be between 0 and 100').optional().nullable(),
  gpsAccuracy: z.number().min(0, 'GPS accuracy cannot be negative').max(100, 'GPS accuracy cannot exceed 100 meters').optional().nullable(),
  recordedAt: z.coerce.date().optional(),
});

export const QueryTelemetrySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  droneId: z.string().cuid('Invalid drone ID format').optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  status: z.enum(['ONLINE', 'OFFLINE', 'IN_FLIGHT', 'CHARGING', 'MAINTENANCE']).optional(),
  sortBy: z.enum(['recordedAt', 'batteryLevel', 'altitude', 'speed']).default('recordedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const TelemetryIdParamSchema = z.object({
  id: z.string().cuid('Invalid telemetry ID format'),
});

export const DroneTelemetryParamSchema = z.object({
  droneId: z.string().cuid('Invalid drone ID format'),
});

export const HistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sortBy: z.enum(['recordedAt', 'batteryLevel', 'altitude', 'speed']).default('recordedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTelemetryInput = z.infer<typeof CreateTelemetrySchema>;
export type QueryTelemetryInput = z.infer<typeof QueryTelemetrySchema>;
export type TelemetryIdParam = z.infer<typeof TelemetryIdParamSchema>;
export type DroneTelemetryParam = z.infer<typeof DroneTelemetryParamSchema>;
export type HistoryQueryInput = z.infer<typeof HistoryQuerySchema>;