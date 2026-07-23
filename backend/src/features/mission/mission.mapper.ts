import { Mission, Drone, DroneStatus } from '@prisma/client';
import { MissionResponse } from './mission.types';

export function toMissionResponse(mission: Mission & { drone: Drone }): MissionResponse {
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

export function toMissionResponses(missions: (Mission & { drone: Drone })[]): MissionResponse[] {
  return missions.map(toMissionResponse);
}