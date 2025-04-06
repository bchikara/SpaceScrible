class WebSocketService {
  private static websocket: WebSocket;

  public static getWebSocket(): WebSocket {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      // Update with correct IP address of your desktop and correct port
      this.websocket = new WebSocket('ws://192.168.0.117:8080');
      console.log('✅ WebSocket initialized with IP:', 'ws://192.168.0.117:8080');
    }

    // WebSocket connection successful
    this.websocket.onopen = () => {
      console.log('✅ WebSocket connected successfully to the desktop app.');
    };

    // WebSocket connection error
    this.websocket.onerror = (error) => {
      console.error('❌ WebSocket connection error:', error);
    };

    // WebSocket connection closed
    this.websocket.onclose = () => {
      console.warn('⚠️ WebSocket connection closed.');
    };

    return this.websocket;
  }
}

export default WebSocketService;
