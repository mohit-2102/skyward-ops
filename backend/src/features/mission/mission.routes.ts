import { Router } from 'express';
import { missionController } from './mission.controller';
import { validate } from '../../middleware/validation';
import { CreateMissionSchema, UpdateMissionSchema, QueryMissionSchema, MissionIdParamSchema } from './mission.validation';

const router = Router();

router.get('/', validate({ query: QueryMissionSchema }), missionController.getAll);
router.get('/:id', validate({ params: MissionIdParamSchema }), missionController.getById);
router.post('/', validate({ body: CreateMissionSchema }), missionController.create);
router.patch('/:id', validate({ params: MissionIdParamSchema, body: UpdateMissionSchema }), missionController.update);
router.delete('/:id', validate({ params: MissionIdParamSchema }), missionController.delete);

export { router as missionRoutes };