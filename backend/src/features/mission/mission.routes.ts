import { Router } from 'express';
import { missionController } from './mission.controller';
import { validate } from '../../middleware/validation';
import {
  CreateMissionSchema,
  UpdateMissionSchema,
  QueryMissionSchema,
  MissionIdParamSchema,
  DroneIdParamSchema,
} from './mission.validation';

const router = Router();

router.get('/stats', missionController.getStats);
router.get('/active', missionController.getActive);
router.get('/completed', validate({ query: QueryMissionSchema }), missionController.getCompleted);
router.get('/drone/:droneId', validate({ params: DroneIdParamSchema, query: QueryMissionSchema }), missionController.getByDrone);
router.get('/:id', validate({ params: MissionIdParamSchema }), missionController.getById);
router.get('/', validate({ query: QueryMissionSchema }), missionController.getAll);
router.post('/', validate({ body: CreateMissionSchema }), missionController.create);
router.patch('/:id', validate({ params: MissionIdParamSchema, body: UpdateMissionSchema }), missionController.update);
router.patch('/:id/start', validate({ params: MissionIdParamSchema }), missionController.start);
router.patch('/:id/complete', validate({ params: MissionIdParamSchema }), missionController.complete);
router.patch('/:id/cancel', validate({ params: MissionIdParamSchema }), missionController.cancel);
router.delete('/:id', validate({ params: MissionIdParamSchema }), missionController.delete);

export { router as missionRoutes };