import { Router } from 'express';
import { maintenanceController } from './maintenance.controller';
import { validate } from '../../middleware/validation';
import {
  CreateMaintenanceSchema,
  UpdateMaintenanceSchema,
  QueryMaintenanceSchema,
  MaintenanceIdParamSchema,
  DroneIdParamSchema,
} from './maintenance.validation';

const router = Router();

router.get('/stats', maintenanceController.getStats);
router.get('/active', maintenanceController.getActive);
router.get('/upcoming', validate({ query: QueryMaintenanceSchema }), maintenanceController.getUpcoming);
router.get('/overdue', validate({ query: QueryMaintenanceSchema }), maintenanceController.getOverdue);
router.get('/drone/:droneId', validate({ params: DroneIdParamSchema, query: QueryMaintenanceSchema }), maintenanceController.getByDrone);
router.get('/:id', validate({ params: MaintenanceIdParamSchema }), maintenanceController.getById);
router.get('/', validate({ query: QueryMaintenanceSchema }), maintenanceController.getAll);
router.post('/', validate({ body: CreateMaintenanceSchema }), maintenanceController.create);
router.patch('/:id', validate({ params: MaintenanceIdParamSchema, body: UpdateMaintenanceSchema }), maintenanceController.update);
router.patch('/:id/start', validate({ params: MaintenanceIdParamSchema }), maintenanceController.start);
router.patch('/:id/complete', validate({ params: MaintenanceIdParamSchema }), maintenanceController.complete);
router.patch('/:id/cancel', validate({ params: MaintenanceIdParamSchema }), maintenanceController.cancel);
router.delete('/:id', validate({ params: MaintenanceIdParamSchema }), maintenanceController.delete);

export { router as maintenanceRoutes };