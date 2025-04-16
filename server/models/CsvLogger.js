const fs = require('fs');
const path = require('path');

class CsvLogger {
  constructor() {
    this.logging = false;
    this.counter = 1;
    this.stream = null;
    this.gyroThreshold = 0.01; // Customize this threshold if needed
  }

  start() {
    if (this.logging) return;
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    let filePath;
    do {
      filePath = path.join(dataDir, `alphabet-${this.counter}.csv`);
      this.counter++;
    } while (fs.existsSync(filePath));

    this.stream = fs.createWriteStream(filePath, { flags: 'w' });
    this.writeHeader();
    this.logging = true;
    console.log('📁 Started new CSV log:', filePath);
  }

  stop() {
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
    this.logging = false;
    console.log('🛑 Stopped CSV logging');
  }

  writeHeader() {
    const headers = [
      'timestamp',
      'acc_x', 'acc_y', 'acc_z',
      'gyro_x', 'gyro_y', 'gyro_z',
      'mag_x', 'mag_y', 'mag_z',
      'baro_pressure',
      'tiltXY', 'tiltYZ', 'tiltXZ',
      'roll', 'pitch', 'yaw',
      'totalTiltFromVertical',
      'angularSpeed', 'heading',
      'altitude'
    ];
    this.headers = headers;
    this.stream.write(headers.join(',') + '\n');
  }

  isGyroStable(gyroData) {
    if (!gyroData) return true;
    const { x = 0, y = 0, z = 0 } = gyroData;
    return (
      Math.abs(x) < this.gyroThreshold ||
      Math.abs(y) < this.gyroThreshold ||
      Math.abs(z) < this.gyroThreshold
    );
  }

  log(data) {
    if (!this.logging || !this.stream) return;

    if (this.isGyroStable(data.gyroscopeData)) {
      console.log('📉 Skipping row - gyroscope stable');
      return;
    }

    const flatten = (prefix, obj) =>
      obj
        ? Object.entries(obj).reduce((acc, [key, val]) => {
            if (!key.toLowerCase().includes('timestamp')) {
              acc[`${prefix}_${key}`] = val;
            }
            return acc;
          }, {})
        : {};

    const row = {
      timestamp: Date.now(),
      ...flatten('acc', data.accelerometerData),
      ...flatten('gyro', data.gyroscopeData),
      ...flatten('mag', data.magnetometerData),
      baro_pressure: data.barometerData?.pressure ?? '',
      tiltXY: data.tiltXY ?? '',
      tiltYZ: data.tiltYZ ?? '',
      tiltXZ: data.tiltXZ ?? '',
      roll: data.roll ?? '',
      pitch: data.pitch ?? '',
      yaw: data.yaw ?? '',
      totalTiltFromVertical: data.totalTiltFromVertical ?? '',
      angularSpeed: data.angularSpeed ?? '',
      heading: data.heading ?? '',
      altitude: data.altitude ?? ''
    };

    const values = this.headers.map((key) => row[key] ?? '');
    this.stream.write(values.join(',') + '\n');
  }
}

module.exports = new CsvLogger();
