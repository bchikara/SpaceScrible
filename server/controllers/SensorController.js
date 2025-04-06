const CsvLogger = require('../models/CsvLogger');

class SensorController {
  handleSensorData(data) {
    CsvLogger.log(data);
  }

  handleControlMessage(action) {
    if (action === 'start') {
      CsvLogger.start();
    } else if (action === 'stop') {
      CsvLogger.stop();
    }
  }
}

module.exports = new SensorController();