import { Router } from 'express';
import { alertController } from './alert.controller';
import { validate } from '../../middleware/validation';
import {
  CreateAlertSchema,
  UpdateAlertSchema,
  QueryAlertSchema,
  AlertIdParamSchema,
  DroneIdParamSchema,
  SeverityParamSchema,
  TypeParamSchema,
} from './alert.validation';

const router = Router();

router.get('/stats', alertController.getStats);
router.get('/active', validate({ query: QueryAlertSchema }), alertController.getActive);
router.get('/severity/:severity', validate({ params: SeverityParamSchema, query: QueryAlertSchema }), alertController.getBySeverity);
router.get('/type/:type', validate({ params: TypeParamSchema, query: QueryAlertSchema }), alertController.getByType);
router.get('/drone/:droneId', validate({ params: DroneIdParamSchema, query: QueryAlertSchema }), alertController.getByDrone);
router.get('/:id', validate({ params: AlertIdParamSchema }), alertController.getById);
router.get('/', validate({ query: QueryAlertSchema }), alertController.getAll);
router.post('/', validate({ body: CreateAlertSchema }), alertController.create);
router.patch('/:id', validate({ params: AlertIdParamSchema, body: UpdateAlertSchema }), alertController.update);
router.patch('/:id/acknowledge', validate({ params: AlertIdParamSchema }), alertController.acknowledge);
router.patch('/:id/resolve', validate({ params: AlertIdParamSchema }), alertController.resolve);
router.delete('/:id', validate({ params: AlertIdParamSchema }), alertController.delete);

export { router as alertRoutes };