const CsvLogger = require('../models/CsvLogger');
let clients = [];

class SensorController {
  constructor() {
    this.logging = false;
  }

  attachClients(ws) {
    clients.push(ws);
  }

  handleSensorData(data) {

      CsvLogger.log(data);
      // Broadcast to all connected Python clients
      const message = JSON.stringify({ type: 'sensorData', data });
      clients.forEach((client) => {

        if (client.readyState === 1) {
          console.log('📤 Broadcasting to clients:', message);
          client.send(message);
        }
      });
  }

  handleControlMessage(action) {
    if (action === 'start') {
      this.logging = true;
      console.log('✅ Logging started');
      
            CsvLogger.start();
      } else if (action === 'stop') {
            CsvLogger.stop();
      this.logging = false;
      console.log('⏸️ Logging paused');
    }
  }
}

module.exports = new SensorController();
module.exports.attachClients = (ws) => clients.push(ws);