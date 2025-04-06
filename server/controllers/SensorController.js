const CsvLogger = require('../models/CsvLogger');

class SensorController {
  handleSensorData(data) {
    CsvLogger.log(data);
  }
}

module.exports = new SensorController();
