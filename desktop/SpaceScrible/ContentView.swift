import SwiftUI

struct ContentView: View {
    @StateObject private var webSocketManager = WebSocketManager()

    var body: some View {
        VStack {
            Text("Sensor Data Visualization")
                .font(.title)
                .padding()

            // ✅ Pass WebSocketManager to SceneView
            SceneView(webSocketManager: webSocketManager)
                .frame(width: 400, height: 400)

            // ✅ Show sensor data dynamically
            if let sensorData = webSocketManager.sensorData {
                Text("Accelerometer: \(sensorData.accelerometer)")
                    .padding(.top)
                Text("Gyroscope: \(sensorData.gyroscope)")
                    .padding(.top)
            } else {
                Text("⏳ Waiting for sensor data...")
                    .padding(.top)
            }
        }
        .onAppear {
            webSocketManager.connectToWebSocket()
        }
        .onDisappear {
            webSocketManager.disconnect()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
