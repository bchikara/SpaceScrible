import SensorModel, { SensorData } from '../models/SensorModel';
import WebSocketService from '../utils/WebSocketService';

class SensorController {
  private websocket: WebSocket;

  constructor() {
    this.websocket = WebSocketService.getWebSocket(); // Get WebSocket instance
  }

  // Start sensor data subscription and send data to desktop
  public async startSensorDataSubscription(
    callback: (data: { accelerometerData: SensorData | null; gyroscopeData: SensorData | null }) => void
  ): Promise<() => void> {
    console.log('✅ Sensor Subscription Started');

    // Subscribe to sensor data and send to WebSocket
    return SensorModel.subscribeToSensors((data) => {
      console.log('📡 Sensor Data Sent to WebSocket:', data); // <-- Add log to verify
      this.sendDataToDesktop(data); // Send sensor data to desktop
      callback(data); // Update UI if needed
    });
  }

  // Send sensor data to the WebSocket server (desktop)
  private sendDataToDesktop(data: { accelerometerData: SensorData | null; gyroscopeData: SensorData | null }) {
    if (this.websocket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'sensorData',
        data: data,
      };
      this.websocket.send(JSON.stringify(message));
      console.log('📨 Data sent successfully to Desktop App');
    } else {
      console.error('❌ WebSocket is not connected. Data could not be sent.');
    }
  }
}

export default new SensorController();
