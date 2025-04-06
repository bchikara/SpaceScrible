import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import SensorController from '../controllers/SensorController';
import { SensorData } from '../models/SensorModel';

interface EnrichedSensorData {
  accelerometerData: SensorData | null;
  gyroscopeData: SensorData | null;
  magnetometerData: SensorData | null;
  barometerData: { pressure: number } | null;

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

const SensorView: React.FC = () => {
  const [sensorData, setSensorData] = useState<EnrichedSensorData>({
    accelerometerData: null,
    gyroscopeData: null,
    magnetometerData: null,
    barometerData: null,

    tiltXY: 0,
    tiltYZ: 0,
    tiltXZ: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
    totalTiltFromVertical: 0,
    angularSpeed: 0,
    heading: 0,
    altitude: 0,
    dominantPlane: '—',
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const startSubscription = async () => {
      unsubscribe = await SensorController.startSensorDataSubscription((data) => {
        setSensorData(data);
      });
    };

    startSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1e1e2f" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subHeader}>📡 Live Sensor Data</Text>

        <SensorCard title="Accelerometer" data={sensorData.accelerometerData} />
        <SensorCard title="Gyroscope" data={sensorData.gyroscopeData} />
        <SensorCard title="Magnetometer" data={sensorData.magnetometerData} />
        <SensorCard title="Barometer" data={sensorData.barometerData} isBarometer />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧠 Computed Values</Text>
          <Text style={styles.dataText}>Tilt XY: {sensorData.tiltXY.toFixed(2)}°</Text>
          <Text style={styles.dataText}>Tilt YZ: {sensorData.tiltYZ.toFixed(2)}°</Text>
          <Text style={styles.dataText}>Tilt XZ: {sensorData.tiltXZ.toFixed(2)}°</Text>
          <Text style={styles.dataText}>Roll: {sensorData.roll.toFixed(2)}°</Text>
          <Text style={styles.dataText}>Pitch: {sensorData.pitch.toFixed(2)}°</Text>
          <Text style={styles.dataText}>Yaw: {sensorData.yaw.toFixed(2)}°</Text>
          <Text style={styles.dataText}>Heading: {sensorData.heading.toFixed(2)}°</Text>
          <Text style={styles.dataText}>Total Tilt from Vertical: {sensorData.totalTiltFromVertical.toFixed(2)}°</Text>
          <Text style={styles.dataText}>Angular Speed: {sensorData.angularSpeed.toFixed(4)} rad/s</Text>
          <Text style={styles.dataText}>Altitude: {sensorData.altitude?.toFixed(2) ?? '—'} m</Text>
          <Text style={[styles.dataText, { fontWeight: 'bold', marginTop: 10 }]}>
            📈 Dominant Plane: {sensorData.dominantPlane}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface SensorCardProps {
  title: string;
  data: any;
  isBarometer?: boolean;
}

const SensorCard: React.FC<SensorCardProps> = ({ title, data, isBarometer = false }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {data ? (
      isBarometer ? (
        <Text style={styles.dataText}>Pressure: {data.pressure.toFixed(2)} hPa</Text>
      ) : (
        <>
          <Text style={styles.dataText}>x: {data.x.toFixed(3)}</Text>
          <Text style={styles.dataText}>y: {data.y.toFixed(3)}</Text>
          <Text style={styles.dataText}>z: {data.z.toFixed(3)}</Text>
        </>
      )
    ) : (
      <Text style={styles.noData}>No data available</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  dataText: {
    fontSize: 16,
    color: '#34495e',
    marginVertical: 2,
  },
  noData: {
    fontSize: 15,
    color: '#aaa',
    fontStyle: 'italic',
  },
});

export default SensorView;