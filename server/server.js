const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const SensorController = require('./controllers/SensorController');
const healthRoute = require('./routes/route');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, perMessageDeflate: false });

app.use('/', healthRoute);

wss.on('connection', (ws) => {
  console.log('✅ Client connected');

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'sensorData') {
        SensorController.handleSensorData(parsed.data);
      }
    } catch (err) {
      console.error('❌ Invalid message:', err);
    }
  });

  ws.on('close', () => {
    console.log('⚠️ Client disconnected');
  });

  ws.send('✅ WebSocket server ready');
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at ws://0.0.0.0:${PORT}`);
});
