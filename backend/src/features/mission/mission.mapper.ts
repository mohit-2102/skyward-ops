import { Mission, Drone, DroneStatus, MissionStatus } from '@prisma/client';
import { MissionResponse } from './mission.types';

export type MissionWithDrone = Mission & {
  drone: {
    id: string;
    serialNumber: string;
    name: string;
    model: string;
    status: DroneStatus;
  };
};

export function toMissionResponse(mission: MissionWithDrone): MissionResponse {
  return {
    id: mission.id,
    name: mission.name,
    description: mission.description,
    droneId: mission.droneId,
    drone: {
      id: mission.drone.id,
      serialNumber: mission.drone.serialNumber,
      name: mission.drone.name,
      model: mission.drone.model,
      status: mission.drone.status,
    },
    status: mission.status,
    plannedStartAt: mission.plannedStartAt,
    actualStartAt: mission.actualStartAt,
    completedAt: mission.completedAt,
    plannedRoute: mission.plannedRoute,
    actualRoute: mission.actualRoute,
    waypoints: mission.waypoints,
    createdAt: mission.createdAt,
    updatedAt: mission.updatedAt,
  };
}

export function toMissionResponses(missions: MissionWithDrone[]): MissionResponse[] {
  return missions.map(toMissionResponse);
}