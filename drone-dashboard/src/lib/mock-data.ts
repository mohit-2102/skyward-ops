import type {
  Drone,
  DroneStatus,
  Manufacturer,
  CameraType,
  PayloadType,
  MissionType,
  Alert,
  ActivityItem,
} from "./drone-types";

// Seeded PRNG for deterministic mock data
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(42);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]!;
const rand = (min: number, max: number) => min + rng() * (max - min);
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

const modelsByMfr: Record<Manufacturer, { model: string; maxSpeed: number; maxAlt: number; maxRange: number; weight: number }[]> = {
  DJI: [
    { model: "Matrice 350 RTK", maxSpeed: 23, maxAlt: 7000, maxRange: 20, weight: 6470 },
    { model: "Mavic 3 Enterprise", maxSpeed: 21, maxAlt: 6000, maxRange: 15, weight: 915 },
    { model: "Matrice 30T", maxSpeed: 23, maxAlt: 7000, maxRange: 18, weight: 3770 },
  ],
  Skydio: [{ model: "X10D", maxSpeed: 20, maxAlt: 4500, maxRange: 12, weight: 2100 }],
  Autel: [{ model: "EVO Max 4T", maxSpeed: 21, maxAlt: 7000, maxRange: 20, weight: 1600 }],
  Parrot: [{ model: "Anafi USA", maxSpeed: 15, maxAlt: 4500, maxRange: 4, weight: 500 }],
  Freefly: [{ model: "Astro", maxSpeed: 22, maxAlt: 6000, maxRange: 10, weight: 3800 }],
  Wingtra: [{ model: "WingtraOne GEN II", maxSpeed: 16, maxAlt: 5500, maxRange: 60, weight: 3700 }],
};

const manufacturers: Manufacturer[] = ["DJI", "Skydio", "Autel", "Parrot", "Freefly", "Wingtra"];
const statuses: DroneStatus[] = ["in-flight", "available", "charging", "maintenance", "offline"];
const cameras: CameraType[] = ["RGB 4K", "Thermal + RGB", "Multispectral", "LiDAR", "Cinema 6K", "Zoom 200x"];
const payloads: PayloadType[] = ["Mapping", "Inspection", "Delivery", "Surveillance", "Research", "Photogrammetry"];
const missions: MissionType[] = [
  "Perimeter Patrol",
  "Aerial Survey",
  "Thermal Inspection",
  "3D Mapping",
  "Research Flight",
  "Delivery Run",
];
const operators = [
  "A. Sharma",
  "R. Iyer",
  "P. Menon",
  "S. Kulkarni",
  "N. Patel",
  "V. Reddy",
  "M. Krishnan",
  "K. Deshpande",
  "J. Bose",
  "T. Nair",
];
const technicians = ["Eng. Rao", "Eng. Kapoor", "Eng. Singh", "Eng. Fernandes"];
const componentNames = ["Motor A", "Motor B", "Motor C", "Motor D", "GPS Module", "IMU", "Gimbal", "Camera Sensor", "Battery Pack", "Radio Link"];

// IIT Bombay approx center
const IITB = { lat: 19.1334, lng: 72.9133 };

export const CAMPUS_CENTER = IITB;

function makeDrone(i: number): Drone {
  const manufacturer = pick(manufacturers);
  const modelInfo = pick(modelsByMfr[manufacturer]);
  const status = pick(statuses);
  const inFlight = status === "in-flight";
  const battery =
    status === "charging"
      ? randInt(20, 95)
      : status === "maintenance"
        ? randInt(0, 100)
        : status === "offline"
          ? randInt(0, 40)
          : randInt(35, 100);

  const idNum = String(i + 1).padStart(3, "0");
  const id = `SKY-${idNum}`;
  const lastMaint = new Date(Date.now() - randInt(5, 90) * 86400000);
  const nextMaint = new Date(Date.now() + randInt(5, 60) * 86400000);
  const flightHours = randInt(40, 1200);

  const components = componentNames.slice(0, randInt(6, 10)).map((name) => ({
    name,
    health: randInt(65, 100),
    lastReplaced: new Date(Date.now() - randInt(10, 400) * 86400000).toISOString(),
  }));

  const maintenanceHistory = Array.from({ length: randInt(3, 8) }).map((_, k) => ({
    id: `${id}-M${k}`,
    date: new Date(Date.now() - (k + 1) * randInt(20, 60) * 86400000).toISOString(),
    type: pick(["Routine Inspection", "Battery Swap", "Firmware Update", "Motor Replacement", "Calibration", "Propeller Change"]),
    technician: pick(technicians),
    notes: "Completed within scheduled window. All systems nominal.",
    status: "completed" as const,
  }));

  const recentFlights = Array.from({ length: randInt(5, 12) }).map((_, k) => ({
    id: `${id}-F${k}`,
    date: new Date(Date.now() - k * randInt(1, 5) * 86400000).toISOString(),
    duration: randInt(8, 45),
    distance: +rand(0.8, 12).toFixed(2),
    mission: pick(missions),
    operator: pick(operators),
  }));

  return {
    id,
    name: `${manufacturer.slice(0, 3).toUpperCase()}-${idNum}`,
    manufacturer,
    model: modelInfo.model,
    serial: `SN${randInt(100000, 999999)}`,
    status,
    battery,
    batteryCycles: randInt(20, 480),
    healthScore: randInt(62, 99),
    lat: IITB.lat + rand(-0.008, 0.008),
    lng: IITB.lng + rand(-0.008, 0.008),
    altitude: inFlight ? randInt(30, 180) : 0,
    speed: inFlight ? +rand(2, 18).toFixed(1) : 0,
    heading: randInt(0, 359),
    signal: inFlight ? randInt(72, 100) : randInt(0, 100),
    temperature: +rand(24, 42).toFixed(1),
    payload: pick(payloads),
    camera: pick(cameras),
    flightTimeToday: randInt(0, 210),
    flightHours,
    operator: pick(operators),
    mission: inFlight ? pick(missions) : "Idle",
    firmware: `v${randInt(3, 6)}.${randInt(0, 9)}.${randInt(0, 20)}`,
    lastMaintenance: lastMaint.toISOString(),
    nextMaintenance: nextMaint.toISOString(),
    purchaseDate: new Date(Date.now() - randInt(180, 1200) * 86400000).toISOString(),
    maxSpeed: modelInfo.maxSpeed,
    maxAltitude: modelInfo.maxAlt,
    maxRange: modelInfo.maxRange,
    weight: modelInfo.weight,
    components,
    maintenanceHistory,
    recentFlights,
    notes:
      "Field-tested at IIT Bombay research airspace. Approved for autonomous BVLOS operations within campus perimeter.",
    lastUpdated: new Date().toISOString(),
  };
}

export const INITIAL_DRONES: Drone[] = Array.from({ length: 30 }).map((_, i) => makeDrone(i));

export const INITIAL_ALERTS: Alert[] = [
  { id: "A1", droneId: "SKY-004", severity: "critical", message: "Battery below 15% — return to base initiated", time: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: "A2", droneId: "SKY-011", severity: "warning", message: "Signal degradation detected in sector 4", time: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: "A3", droneId: "SKY-019", severity: "warning", message: "Motor B temperature above nominal range", time: new Date(Date.now() - 22 * 60000).toISOString() },
  { id: "A4", droneId: "SKY-007", severity: "info", message: "Firmware update available (v5.2.1)", time: new Date(Date.now() - 55 * 60000).toISOString() },
  { id: "A5", droneId: "SKY-023", severity: "critical", message: "GPS lock lost — auto-land engaged", time: new Date(Date.now() - 70 * 60000).toISOString() },
];

export const INITIAL_ACTIVITY: ActivityItem[] = [
  { id: "V1", droneId: "SKY-002", action: "Launched — Aerial Survey", time: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "V2", droneId: "SKY-006", action: "Returned to base", time: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: "V3", droneId: "SKY-014", action: "Charging started (32%)", time: new Date(Date.now() - 14 * 60000).toISOString() },
  { id: "V4", droneId: "SKY-021", action: "Mission complete — 3D Mapping", time: new Date(Date.now() - 26 * 60000).toISOString() },
  { id: "V5", droneId: "SKY-009", action: "Maintenance scheduled", time: new Date(Date.now() - 44 * 60000).toISOString() },
  { id: "V6", droneId: "SKY-017", action: "Waypoint reached", time: new Date(Date.now() - 61 * 60000).toISOString() },
];
