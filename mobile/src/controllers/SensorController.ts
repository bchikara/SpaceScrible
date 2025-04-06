import SensorModel, { SensorData } from '../models/SensorModel';
import WebSocketService from '../utils/WebSocketService';

export interface AllSensorData {
  accelerometerData: SensorData | null;
  gyroscopeData: SensorData | null;
  magnetometerData: SensorData | null;
  barometerData: { pressure: number } | null;
}

export interface EnrichedSensorData extends AllSensorData {
  tiltXY: number;
  tiltYZ: number;
  tiltXZ: number;
  roll: number;
  pitch: number;
  yaw: number;
  totalTiltFromVertical: number;
  angularSpeed: number;
  heading: number;
  altitude?: number;
  dominantPlane: string;
}

class SensorController {
  private websocket: WebSocket;
  private initialPressure: number | null = null;

  // ✅ Keep last 15 planes for smoothing
  private dominantPlaneHistory: string[] = [];

  constructor() {
    this.websocket = WebSocketService.getWebSocket();
  }

  public async startSensorDataSubscription(
    callback: (data: EnrichedSensorData) => void
  ): Promise<() => void> {
    console.log('✅ Sensor Subscription Started');

    return SensorModel.subscribeToSensors((data) => {
      const enriched = this.computeAdvancedMetrics(data);
      this.sendDataToDesktop(enriched);
      callback(enriched);
    });
  }

  private computeAdvancedMetrics(data: AllSensorData): EnrichedSensorData {
    const { accelerometerData: acc, gyroscopeData: gyro, magnetometerData: mag, barometerData: baro } = data;

    const toDeg = (r: number) => r * (180 / Math.PI);
    const safe = (val?: number) => val ?? 0;

    const x = safe(acc?.x);
    const y = safe(acc?.y);
    const z = safe(acc?.z);

    const tiltXY = acc ? toDeg(Math.atan2(y, x)) : 0;
    const tiltYZ = acc ? toDeg(Math.atan2(z, y)) : 0;
    const tiltXZ = acc ? toDeg(Math.atan2(z, x)) : 0;

    const roll  = acc ? toDeg(Math.atan2(y, z)) : 0;
    const pitch = acc ? toDeg(Math.atan2(-x, Math.sqrt(y ** 2 + z ** 2))) : 0;
    const yaw   = mag ? toDeg(Math.atan2(safe(mag.y), safe(mag.x))) : 0;

    const accMag = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    const totalTiltFromVertical = acc ? toDeg(Math.acos(z / accMag)) : 0;

    const angularSpeed = gyro
      ? Math.sqrt(safe(gyro.x) ** 2 + safe(gyro.y) ** 2 + safe(gyro.z) ** 2)
      : 0;

    let altitude: number | undefined = undefined;
    if (baro) {
      if (this.initialPressure === null) this.initialPressure = baro.pressure;
      const pressureRatio = baro.pressure / this.initialPressure;
      altitude = 44330 * (1.0 - Math.pow(pressureRatio, 1 / 5.255));
    }

    const heading = mag ? (toDeg(Math.atan2(mag.y, mag.x)) + 360) % 360 : 0;

    // ✅ Raw dominant plane from tilt angles
    const absXY = Math.abs(tiltXY);
    const absYZ = Math.abs(tiltYZ);
    const absXZ = Math.abs(tiltXZ);

    let rawPlane = 'XY';
    let maxTilt = absXY;

    if (absYZ > maxTilt) {
      rawPlane = 'YZ';
      maxTilt = absYZ;
    }
    if (absXZ > maxTilt) {
      rawPlane = 'XZ';
    }

    // Optional: If tilts are all close, mark as stable
    const tiltThreshold = 6; // degrees
    if (
      Math.abs(absXY - absYZ) < tiltThreshold &&
      Math.abs(absXY - absXZ) < tiltThreshold &&
      Math.abs(absYZ - absXZ) < tiltThreshold
    ) {
      rawPlane = 'Stable';
    }

    const dominantPlane = this.getSmoothedPlane(rawPlane);

    return {
      ...data,
      tiltXY,
      tiltYZ,
      tiltXZ,
      roll,
      pitch,
      yaw,
      totalTiltFromVertical,
      angularSpeed,
      heading,
      altitude,
      dominantPlane,
    };
  }

  // ✅ Smoothing using larger history buffer
  private getSmoothedPlane(current: string): string {
    const MAX_HISTORY = 15; // You can increase to 20+ if needed
    this.dominantPlaneHistory.push(current);

    if (this.dominantPlaneHistory.length > MAX_HISTORY) {
      this.dominantPlaneHistory.shift(); // drop oldest
    }

    const counts: Record<string, number> = {};
    for (const plane of this.dominantPlaneHistory) {
      counts[plane] = (counts[plane] || 0) + 1;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const [mostFrequentPlane, count] = sorted[0];

    // ✅ Require a minimum majority to be considered stable
    const isStable = count >= Math.ceil(MAX_HISTORY / 2);
    return isStable ? mostFrequentPlane : 'Unstable';
  }

  private sendDataToDesktop(data: EnrichedSensorData) {
    if (this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'sensorData',
        data,
      }));
      console.log('📨 Enriched sensor data sent to desktop');
    } else {
      console.error('❌ WebSocket not connected. Cannot send data.');
    }
  }
}

export default new SensorController();
