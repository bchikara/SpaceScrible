// Import required packages
const http = require('http');
const express = require('express');
const WebSocket = require('ws');

const app = express();

// Create an HTTP server and pass it to WebSocket.Server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, perMessageDeflate: false });

// Middleware to serve a basic route
app.get('/', (req, res) => {
  res.send('✅ WebSocket server is up and running!');
});

// Store connected clients
const clients = new Set();

// WebSocket connection setup
wss.on('connection', (ws) => {
  console.log('✅ Client connected');
  clients.add(ws); // Add the connected client to the set

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    console.log(`📩 Received: ${message}`);
    try {
      const parsedMessage = JSON.parse(message);

      // ✅ If sensor data is received, forward it to all connected clients (including Swift)
      if (parsedMessage.type === 'sensorData') {
        console.log('📡 Received sensor data:', parsedMessage.data);

        // Forward data to all connected clients
        broadcastToClients(parsedMessage.data);
      }
    } catch (error) {
      console.error('❌ Error parsing incoming message:', error);
    }
  });

  // Handle errors
  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err);
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('⚠️ Client disconnected');
    clients.delete(ws); // Remove client from set
  });

  ws.send('✅ WebSocket server ready');
});

// 🔥 Function to broadcast sensor data to all connected clients
function broadcastToClients(data) {
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'sensorData', data }));
    }
  }
}

// Start HTTP and WebSocket server on port 8080
const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WebSocket server running at ws://0.0.0.0:${PORT}`);
});
