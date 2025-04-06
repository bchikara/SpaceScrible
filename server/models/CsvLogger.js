const fs = require('fs');
const path = require('path');

class CsvLogger {
  constructor() {
    this.logging = false;
    this.counter = 1;
    this.stream = null;
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
    this.stream.write(headers.join(',') + '\n');
  }

  log(data) {
    if (!this.logging || !this.stream) return;

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
