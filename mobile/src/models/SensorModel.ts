import { accelerometer, gyroscope, SensorTypes, setUpdateIntervalForType } from 'react-native-sensors';
import DeviceInfo from 'react-native-device-info'; // Import device info module
import { Platform } from 'react-native';

// Sensor data type interface
export interface SensorData {
  x: number;
  y: number;
  z: number;
}

class SensorModel {
  private accelerometerData: SensorData | null = null;
  private gyroscopeData: SensorData | null = null;

  constructor() {
    // Set sensor update intervals (100ms)
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    setUpdateIntervalForType(SensorTypes.gyroscope, 100);

    // Inform that no permissions are required for sensors on Android
    if (Platform.OS === 'android') {
      console.log('No specific permissions required for sensors on Android');
    }
  }

  // Corrected isSimulator() with async/await
  private async isSimulator(): Promise<boolean> {
    try {
      const isEmulator = await DeviceInfo.isEmulator();
      return isEmulator;
    } catch (error) {
      console.error('Error checking if running on simulator:', error);
      return false;
    }
  }

  // Make subscribeToSensors asynchronous
  public async subscribeToSensors(
    callback: (data: { accelerometerData: SensorData | null; gyroscopeData: SensorData | null }) => void
  ) {
    // Await the simulator check
    const isSim = await this.isSimulator();
    if (isSim) {
      console.log('Running on a simulator. Sensor subscription skipped.');
      callback({ accelerometerData: null, gyroscopeData: null });
      return () => {}; // Return an empty cleanup function
    }

    // Accelerometer subscription
    const accelerometerSubscription = accelerometer.subscribe({
      next: (data) => {
        console.log('Accelerometer Data Received:', data); // Log accelerometer data
        this.accelerometerData = data;
        callback({ accelerometerData: this.accelerometerData, gyroscopeData: this.gyroscopeData });
      },
      error: (error) => {
        console.error('Error with accelerometer:', error);
      },
    });

    // Gyroscope subscription
    const gyroscopeSubscription = gyroscope.subscribe({
      next: (data) => {
        console.log('Gyroscope Data Received:', data); // Log gyroscope data
        this.gyroscopeData = data;
        callback({ accelerometerData: this.accelerometerData, gyroscopeData: this.gyroscopeData });
      },
      error: (error) => {
        console.error('Error with gyroscope:', error);
        callback({ accelerometerData: this.accelerometerData, gyroscopeData: null });
      },
    });

    // Return cleanup function to unsubscribe when not needed
    return () => {
      console.log('Unsubscribing from sensors...');
      accelerometerSubscription.unsubscribe();
      gyroscopeSubscription.unsubscribe();
    };
  }
}

export default new SensorModel();
