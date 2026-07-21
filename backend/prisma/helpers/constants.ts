// ============================================
// CONSTANTS
// Centralized configuration for seed data generation
// ============================================

// Operational area boundaries (San Francisco Bay Area)
export const OPERATIONAL_AREA = {
  // San Francisco coordinates
  center: { latitude: 37.7749, longitude: -122.4194 },
  // ~15km radius
  radiusKm: 15,
  altitudeRange: { min: 0, max: 500 }, // meters
} as const;

// Manufacturer data - authentic, not randomized
export const MANUFACTURERS = [
  { name: 'DJI', country: 'China', website: 'https://www.dji.com' },
  { name: 'Skydio', country: 'USA', website: 'https://www.skydio.com' },
  { name: 'Autel Robotics', country: 'China', website: 'https://autelrobotics.com' },
  { name: 'Parrot', country: 'France', website: 'https://www.parrot.com' },
  { name: 'Yuneec', country: 'China', website: 'https://www.yuneec.com' },
] as const;

// Drone models by manufacturer - realistic specifications
export type DroneModelSpec = {
  model: string;
  payloadCapacity: number;
  camera: string;
  weight: number;
  maxFlightTime: number;
  maxSpeed: number;
};

export const DRONE_MODELS: Record<string, readonly DroneModelSpec[]> = {
  DJI: [
    { model: 'Matrice 350 RTK', payloadCapacity: 2.7, camera: 'Zenmuse H20T', weight: 3.8, maxFlightTime: 55, maxSpeed: 23 },
    { model: 'Matrice 300 RTK', payloadCapacity: 2.7, camera: 'Zenmuse H20', weight: 3.6, maxFlightTime: 55, maxSpeed: 23 },
    { model: 'Mavic 3 Enterprise', payloadCapacity: 0.5, camera: '4/3 CMOS 20MP', weight: 0.92, maxFlightTime: 45, maxSpeed: 21 },
    { model: 'Mavic 3 Thermal', payloadCapacity: 0.5, camera: 'Thermal + 48MP Visual', weight: 0.92, maxFlightTime: 45, maxSpeed: 21 },
    { model: 'Inspire 3', payloadCapacity: 1.5, camera: 'X9-8K Air', weight: 3.99, maxFlightTime: 28, maxSpeed: 26 },
  ],
  Skydio: [
    { model: 'X10', payloadCapacity: 1.5, camera: 'Thermal + 48MP Visual', weight: 2.2, maxFlightTime: 40, maxSpeed: 20 },
    { model: 'X2D', payloadCapacity: 0.3, camera: '12MP + Thermal', weight: 1.3, maxFlightTime: 35, maxSpeed: 18 },
    { model: 'Skydio 2+', payloadCapacity: 0.2, camera: '12MP 4K60', weight: 0.8, maxFlightTime: 27, maxSpeed: 16 },
  ],
  'Autel Robotics': [
    { model: 'EVO Max 4T', payloadCapacity: 0.5, camera: 'Thermal + 48MP + Wide', weight: 1.6, maxFlightTime: 42, maxSpeed: 23 },
    { model: 'EVO II Dual 640T', payloadCapacity: 0.3, camera: 'Thermal + 8K', weight: 1.2, maxFlightTime: 40, maxSpeed: 20 },
    { model: 'Dragonfish Pro', payloadCapacity: 2.5, camera: 'Modular Payload', weight: 7.5, maxFlightTime: 158, maxSpeed: 30 },
  ],
  Parrot: [
    { model: 'ANAFI USA', payloadCapacity: 0.2, camera: '32x Zoom + Thermal', weight: 0.5, maxFlightTime: 32, maxSpeed: 15 },
    { model: 'ANAFI Ai', payloadCapacity: 0.3, camera: '48MP 4K', weight: 0.9, maxFlightTime: 32, maxSpeed: 16 },
  ],
  Yuneec: [
    { model: 'H520E', payloadCapacity: 1.6, camera: 'E90 / CGOET', weight: 1.6, maxFlightTime: 28, maxSpeed: 15 },
    { model: 'H850-RTK', payloadCapacity: 3.0, camera: 'Modular', weight: 4.8, maxFlightTime: 65, maxSpeed: 20 },
  ],
} as const;

// Realistic drone names for human-readable display
export const DRONE_NAMES = [
  'Inspection Drone 01',
  'Inspection Drone 02',
  'Survey Drone Alpha',
  'Survey Drone Bravo',
  'Survey Drone Charlie',
  'Recon Drone 01',
  'Recon Drone 02',
  'Thermal Scout 01',
  'Thermal Scout 02',
  'Warehouse Scout A',
  'Warehouse Scout B',
  'Pipeline Monitor 01',
  'Pipeline Monitor 02',
  'Power Line Inspector',
  'Solar Farm Scanner 01',
  'Solar Farm Scanner 02',
  'Search & Rescue 01',
  'Search & Rescue 02',
  'Construction Eye 01',
  'Construction Eye 02',
  'Border Patrol 01',
  'Maritime Watch 01',
  'Forest Ranger 01',
  'Forest Ranger 02',
  'Urban Mapper 01',
  'Urban Mapper 02',
  'Emergency Response 01',
  'Emergency Response 02',
  'Infrastructure 01',
  'Infrastructure 02',
] as const;

// Realistic mission names
export const MISSION_TEMPLATES = [
  { name: 'Roof Inspection - Downtown', description: 'Visual and thermal inspection of commercial building rooftops', type: 'INSPECTION' },
  { name: 'Pipeline Survey - Sector 7', description: 'Long-distance pipeline corridor mapping and leak detection', type: 'SURVEY' },
  { name: 'Power Line Inspection - Grid North', description: 'High-voltage transmission line inspection with thermal imaging', type: 'INSPECTION' },
  { name: 'Search Operation - Missing Hiker', description: 'Grid search pattern for missing person in wilderness area', type: 'SEARCH' },
  { name: 'Construction Monitoring - Phase 3', description: 'Weekly progress documentation for high-rise construction site', type: 'MONITORING' },
  { name: 'Solar Farm Performance Audit', description: 'Thermal inspection of 50MW solar array for hotspot detection', type: 'INSPECTION' },
  { name: 'Bridge Structural Assessment', description: 'Detailed visual inspection of bridge supports and decking', type: 'INSPECTION' },
  { name: 'Wildfire Perimeter Mapping', description: 'Real-time fire boundary tracking for incident command', type: 'MONITORING' },
  { name: 'Coastal Erosion Survey', description: 'Photogrammetric survey of coastline changes after storm season', type: 'SURVEY' },
  { name: 'Cell Tower Inspection - Cluster 4', description: 'Structural and equipment inspection of telecommunications towers', type: 'INSPECTION' },
  { name: 'Wind Turbine Blade Inspection', description: 'Close-range visual inspection of turbine blades for damage', type: 'INSPECTION' },
  { name: 'Railway Corridor Inspection', description: 'Track and right-of-way inspection for 50km rail segment', type: 'INSPECTION' },
  { name: 'Disaster Damage Assessment', description: 'Post-hurricane infrastructure damage mapping for insurance', type: 'SURVEY' },
  { name: 'Precision Agriculture - Field 12', description: 'Multispectral crop health analysis for corn/soybean rotation', type: 'MONITORING' },
  { name: 'Harbor Security Patrol', description: 'Automated perimeter patrol of port facility', type: 'PATROL' },
] as const;

// Maintenance types with typical costs and intervals
export const MAINTENANCE_TEMPLATES = [
  { type: 'ROUTINE', description: 'Scheduled 100-hour inspection', baseCost: 150, intervalHours: 100 },
  { type: 'INSPECTION', description: 'Pre-flight safety inspection', baseCost: 50, intervalHours: 20 },
  { type: 'FIRMWARE_UPDATE', description: 'Firmware and payload software update', baseCost: 0, intervalHours: 500 },
  { type: 'BATTERY_REPLACEMENT', description: 'Battery pack replacement', baseCost: 450, intervalHours: 300 },
  { type: 'PROPELLER_REPLACEMENT', description: 'Full propeller set replacement', baseCost: 120, intervalHours: 200 },
  { type: 'MOTOR_SERVICE', description: 'Motor bearing inspection and lubrication', baseCost: 280, intervalHours: 400 },
  { type: 'CALIBRATION', description: 'IMU, compass, and gimbal calibration', baseCost: 200, intervalHours: 150 },
  { type: 'REPAIR', description: 'Landing gear replacement after hard landing', baseCost: 350, intervalHours: 0 },
] as const;

// Alert templates
export const ALERT_TEMPLATES = [
  { type: 'LOW_BATTERY', severity: 'HIGH', message: 'Battery level below 20%, return to base recommended' },
  { type: 'LOW_BATTERY', severity: 'CRITICAL', message: 'Battery level below 10%, initiating emergency landing' },
  { type: 'GPS_SIGNAL', severity: 'MEDIUM', message: 'GPS signal degraded, switching to ATTI mode' },
  { type: 'GPS_SIGNAL', severity: 'HIGH', message: 'GPS signal lost, returning to home position' },
  { type: 'COMMUNICATION', severity: 'MEDIUM', message: 'Telemetry link intermittent, attempting reconnection' },
  { type: 'COMMUNICATION', severity: 'HIGH', message: 'Communication lost for 30 seconds, executing failsafe' },
  { type: 'SYSTEM', severity: 'LOW', message: 'Firmware update available for flight controller' },
  { type: 'SYSTEM', severity: 'MEDIUM', message: 'IMU calibration recommended before next flight' },
  { type: 'OBSTACLE', severity: 'HIGH', message: 'Obstacle detected at 15m, executing avoidance maneuver' },
  { type: 'OBSTACLE', severity: 'CRITICAL', message: 'Imminent collision risk, emergency stop engaged' },
] as const;

// Firmware versions by manufacturer
export const FIRMWARE_VERSIONS = {
  DJI: ['01.00.0600', '01.00.0700', '01.01.0000', '01.01.0100'],
  Skydio: ['21.1.0', '21.2.0', '21.3.1', '22.0.0'],
  'Autel Robotics': ['1.8.2', '1.9.0', '2.0.1', '2.1.0'],
  Parrot: ['1.6.4', '1.7.0', '1.7.2', '1.8.0'],
  Yuneec: ['2.4.1', '2.5.0', '2.5.2', '2.6.0'],
} as const;

// Time ranges
export const TIME_RANGES = {
  telemetryHours: 6,           // Last 6 hours of telemetry
  missionDays: 30,             // Missions from last 30 days
  maintenanceDays: 180,        // Maintenance from last 6 months
  alertDays: 14,               // Alerts from last 2 weeks
} as const;

// Counts
export const SEED_COUNTS = {
  drones: 25,
  telemetryPerDrone: 30,
  missions: 20,
  maintenancePerDrone: 4,
  alerts: 40,
} as const;

// Movement simulation parameters
export const MOVEMENT_PARAMS = {
  telemetryIntervalSeconds: 10,
  maxTurnDegrees: 30,
  maxSpeedChange: 3, // m/s
  maxAltitudeChange: 5, // meters
  boundaryPullbackFactor: 2,
} as const;

// Weather simulation
export const WEATHER = {
  // Generate new weather snapshot every N telemetry records
  snapshotInterval: 10,
  temperatureRange: { min: -5, max: 35 },
  humidityRange: { min: 20, max: 90 },
  windSpeedRange: { min: 0, max: 25 },
} as const;

// Battery drain rates per status (percentage per telemetry interval)
export const BATTERY_DRAIN = {
  IN_FLIGHT: 0.8,
  ONLINE: 0.1,
  OFFLINE: 0.01,
  CHARGING: -2.0, // negative = charging
  MAINTENANCE: 0.05,
} as const;

// Technicians and operators
export const TECHNICIANS = ['Anderson', 'Chen', 'Rodriguez', 'Patel', 'Kim', 'Johnson', 'Williams', 'Brown'] as const;
export const OPERATORS = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'] as const;

// Serial number generation
export const SERIAL_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' as const;