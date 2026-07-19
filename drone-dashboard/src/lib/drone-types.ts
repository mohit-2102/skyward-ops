export type DroneStatus =
  | "in-flight"
  | "available"
  | "charging"
  | "maintenance"
  | "offline";

export type Manufacturer =
  | "DJI"
  | "Skydio"
  | "Autel"
  | "Parrot"
  | "Freefly"
  | "Wingtra";

export type CameraType =
  | "RGB 4K"
  | "Thermal + RGB"
  | "Multispectral"
  | "LiDAR"
  | "Cinema 6K"
  | "Zoom 200x";

export type PayloadType =
  | "Mapping"
  | "Inspection"
  | "Delivery"
  | "Surveillance"
  | "Research"
  | "Photogrammetry";

export type MissionType =
  | "Perimeter Patrol"
  | "Aerial Survey"
  | "Thermal Inspection"
  | "3D Mapping"
  | "Research Flight"
  | "Delivery Run"
  | "Idle";

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  technician: string;
  notes: string;
  status: "completed" | "scheduled" | "in-progress";
}

export interface FlightRecord {
  id: string;
  date: string;
  duration: number; // minutes
  distance: number; // km
  mission: MissionType;
  operator: string;
}

export interface Drone {
  id: string;
  name: string;
  manufacturer: Manufacturer;
  model: string;
  serial: string;
  status: DroneStatus;
  battery: number;
  batteryCycles: number;
  healthScore: number;
  lat: number;
  lng: number;
  altitude: number; // meters
  speed: number; // m/s
  heading: number;
  signal: number; // 0-100
  temperature: number; // C
  payload: PayloadType;
  camera: CameraType;
  flightTimeToday: number; // minutes
  flightHours: number;
  operator: string;
  mission: MissionType;
  firmware: string;
  lastMaintenance: string;
  nextMaintenance: string;
  purchaseDate: string;
  maxSpeed: number;
  maxAltitude: number;
  maxRange: number;
  weight: number; // g
  components: { name: string; health: number; lastReplaced: string }[];
  maintenanceHistory: MaintenanceRecord[];
  recentFlights: FlightRecord[];
  notes: string;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  droneId: string;
  severity: "critical" | "warning" | "info";
  message: string;
  time: string;
}

export interface ActivityItem {
  id: string;
  droneId: string;
  action: string;
  time: string;
}
