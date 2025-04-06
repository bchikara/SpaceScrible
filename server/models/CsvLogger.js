const fs = require('fs');
const path = require('path');

class CsvLogger {
  constructor() {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir); // ✅ Create folder if not exists
    }

    this.filePath = path.join(dataDir, 'sensor-data.csv');
    this.stream = fs.createWriteStream(this.filePath, { flags: 'w' });
    this.writeHeader();
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
    this.stream.write(headers.join(',') + '\n');
  }

  log(data) {
    const flatten = (prefix, obj) =>
      obj
        ? Object.entries(obj).reduce((acc, [key, val]) => {
            acc[`${prefix}_${key}`] = val;
            return acc;
          }, {})
        : {};

    const row = {
      timestamp: Date.now(),
      ...flatten('acc', data.accelerometerData),
      ...flatten('gyro', data.gyroscopeData),
      ...flatten('mag', data.magnetometerData),
      baro_pressure: data.barometerData?.pressure ?? '',
      tiltXY: data.tiltXY,
      tiltYZ: data.tiltYZ,
      tiltXZ: data.tiltXZ,
      roll: data.roll,
      pitch: data.pitch,
      yaw: data.yaw,
      totalTiltFromVertical: data.totalTiltFromVertical,
      angularSpeed: data.angularSpeed,
      heading: data.heading,
      altitude: data.altitude ?? '',
    };

    this.stream.write(Object.values(row).join(',') + '\n');
  }
}

module.exports = new CsvLogger();