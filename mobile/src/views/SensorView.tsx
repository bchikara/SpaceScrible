import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import SensorController from '../controllers/SensorController';
import { SensorData } from '../models/SensorModel';

const SensorView: React.FC = () => {
  const [accelerometerData, setAccelerometerData] = useState<SensorData | null>(null);
  const [gyroscopeData, setGyroscopeData] = useState<SensorData | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Start subscription for sensor data using async function
    const startSubscription = async () => {
      unsubscribe = await SensorController.startSensorDataSubscription((data) => {
        setAccelerometerData(data.accelerometerData);
        setGyroscopeData(data.gyroscopeData);
      });
    };

    startSubscription();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <SafeAreaView>
      <Text>Accelerometer: {JSON.stringify(accelerometerData)}</Text>
      <Text>Gyroscope: {JSON.stringify(gyroscopeData)}</Text>
    </SafeAreaView>
  );
};

export default SensorView;
