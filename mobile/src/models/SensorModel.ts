import {
  accelerometer,
  gyroscope,
  magnetometer,
  barometer,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

// Sensor data type interface
export interface SensorData {
  x: number;
  y: number;
  z: number;
}

export interface AllSensorData {
  accelerometerData: SensorData | null;
  gyroscopeData: SensorData | null;
  magnetometerData: SensorData | null;
  barometerData: { pressure: number } | null;
}

class SensorModel {
  private accelerometerData: SensorData | null = null;
  private gyroscopeData: SensorData | null = null;
  private magnetometerData: SensorData | null = null;
  private barometerData: { pressure: number } | null = null;

  constructor() {
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    setUpdateIntervalForType(SensorTypes.gyroscope, 100);
    setUpdateIntervalForType(SensorTypes.magnetometer, 100);
    setUpdateIntervalForType(SensorTypes.barometer, 100);

    if (Platform.OS === 'android') {
      console.log('No specific permissions required for sensors on Android');
    }
  }

  private async isSimulator(): Promise<boolean> {
    try {
      return await DeviceInfo.isEmulator();
    } catch (error) {
      console.error('Error checking if emulator:', error);
      return false;
    }
  }

  public async subscribeToSensors(callback: (data: AllSensorData) => void) {
    const isSim = await this.isSimulator();
    if (isSim) {
      console.log('Running on simulator. Sensor data disabled.');
      callback({
        accelerometerData: null,
        gyroscopeData: null,
        magnetometerData: null,
        barometerData: null,
      });
      return () => {};
    }

    const accelerometerSubscription = accelerometer.subscribe({
      next: (data) => {
        this.accelerometerData = data;
        callback(this.buildCallbackData());
      },
      error: (error) => console.error('Accelerometer error:', error),
    });

    const gyroscopeSubscription = gyroscope.subscribe({
      next: (data) => {
        this.gyroscopeData = data;
        callback(this.buildCallbackData());
      },
      error: (error) => console.error('Gyroscope error:', error),
    });

    const magnetometerSubscription = magnetometer.subscribe({
      next: (data) => {
        this.magnetometerData = data;
        callback(this.buildCallbackData());
      },
      error: (error) => console.error('Magnetometer error:', error),
    });

    const barometerSubscription = barometer.subscribe({
      next: (data) => {
        this.barometerData = { pressure: data.pressure };
        callback(this.buildCallbackData());
      },
      error: (error) => console.error('Barometer error:', error),
    });

    return () => {
      accelerometerSubscription.unsubscribe();
      gyroscopeSubscription.unsubscribe();
      magnetometerSubscription.unsubscribe();
      barometerSubscription.unsubscribe();
    };
  }

  private buildCallbackData(): AllSensorData {
    return {
      accelerometerData: this.accelerometerData,
      gyroscopeData: this.gyroscopeData,
      magnetometerData: this.magnetometerData,
      barometerData: this.barometerData,
    };
  }
}

export default new SensorModel();
