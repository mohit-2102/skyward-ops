import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { validate } from '../../middleware/validation';
import { DashboardQuerySchema } from './dashboard.validation';

const router = Router();

const dashboardValidation = validate({ query: DashboardQuerySchema });

router.get('/overview', dashboardValidation, dashboardController.getOverview);
router.get('/fleet', dashboardValidation, dashboardController.getFleet);
router.get('/map', dashboardValidation, dashboardController.getMap);
router.get('/activity', dashboardValidation, dashboardController.getActivity);
router.get('/health', dashboardValidation, dashboardController.getHealth);
router.get('/missions', dashboardValidation, dashboardController.getMissions);
router.get('/maintenance', dashboardValidation, dashboardController.getMaintenance);
router.get('/alerts', dashboardValidation, dashboardController.getAlerts);
router.get('/telemetry', dashboardValidation, dashboardController.getTelemetry);

export { router as dashboardRoutes };