import { Router } from 'express';
import { droneController } from './drone.controller';
import { validate } from '../../middleware/validation';
import { CreateDroneSchema, UpdateDroneSchema, QueryDroneSchema, DroneIdParamSchema } from './drone.validation';

const router = Router();

router.get('/', validate({ query: QueryDroneSchema }), droneController.getAll);
router.get('/:id', validate({ params: DroneIdParamSchema }), droneController.getById);
router.post('/', validate({ body: CreateDroneSchema }), droneController.create);
router.patch('/:id', validate({ params: DroneIdParamSchema, body: UpdateDroneSchema }), droneController.update);
router.delete('/:id', validate({ params: DroneIdParamSchema }), droneController.delete);

export { router as droneRoutes };