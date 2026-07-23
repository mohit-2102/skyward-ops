import { Router } from 'express';
import { telemetryController } from './telemetry.controller';
import { validate } from '../../middleware/validation';
import {
  CreateTelemetrySchema,
  QueryTelemetrySchema,
  TelemetryIdParamSchema,
  DroneTelemetryParamSchema,
  HistoryQuerySchema,
} from './telemetry.validation';

const router = Router();

router.get('/stats', telemetryController.getStats);
router.get('/drone/:droneId/latest', validate({ params: DroneTelemetryParamSchema }), telemetryController.getLatestByDroneId);
router.get('/drone/:droneId/history', validate({ params: DroneTelemetryParamSchema, query: HistoryQuerySchema }), telemetryController.getHistoryByDroneId);
router.get('/:id', validate({ params: TelemetryIdParamSchema }), telemetryController.getById);
router.get('/', validate({ query: QueryTelemetrySchema }), telemetryController.getAll);
router.post('/', validate({ body: CreateTelemetrySchema }), telemetryController.create);
router.delete('/:id', validate({ params: TelemetryIdParamSchema }), telemetryController.delete);

export { router as telemetryRoutes };