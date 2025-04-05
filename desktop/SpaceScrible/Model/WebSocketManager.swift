import Foundation

class WebSocketManager: ObservableObject {
    private var webSocketTask: URLSessionWebSocketTask?
    @Published var sensorData: SensorData?

    // ✅ Previous sensor data for applying low-pass and complementary filters
    private var previousAccelerometerData: SensorValues?
    private var previousGyroscopeData: SensorValues?
    private var fusedData: SensorValues?

    // ✅ Smoothing factor for low-pass filter
    private let alpha: Double = 0.1

    // ✅ Complementary filter ratio (for fusion between accelerometer and gyroscope)
    private let filterAlpha: Double = 0.98

    // ✅ Throttling interval to reduce unnecessary updates
    private var lastUpdateTime: TimeInterval = 0
    private let updateInterval: TimeInterval = 0.05 // 20 Hz (50 ms)

    // ✅ Kalman filters for x, y, z axes
    private var kalmanX = KalmanFilter(q: 0.01, r: 0.1, initialValue: 0.0)
    private var kalmanY = KalmanFilter(q: 0.01, r: 0.1, initialValue: 0.0)
    private var kalmanZ = KalmanFilter(q: 0.01, r: 0.1, initialValue: 0.0)

    init() {
        self.connectToWebSocket()
    }

    func connectToWebSocket() {
        let url = URL(string: "ws://192.168.172.228:8080")! // Replace with your IP
        let session = URLSession(configuration: .default)
        webSocketTask = session.webSocketTask(with: url)
        webSocketTask?.resume()

        print("✅ WebSocket connection started to \(url)")
        listenForMessages()
    }

    func listenForMessages() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .data(let data):
                    self?.handleData(data)
                case .string(let string):
                    if let data = string.data(using: .utf8) {
                        self?.handleData(data)
                    }
                }
            case .failure(let error):
                print("❌ WebSocket error: \(error)")
            }
            self?.listenForMessages()
        }
    }

    func handleData(_ data: Data) {
        do {
            let wrapper = try JSONDecoder().decode(SensorWrapper.self, from: data)
            var sensorData = wrapper.data

            // ✅ Apply Kalman filter to accelerometer data
            sensorData.accelerometer = SensorValues(
                x: Double(kalmanX.update(measurement: Float(sensorData.accelerometer.x))),
                y: Double(kalmanY.update(measurement: Float(sensorData.accelerometer.y))),
                z: Double(kalmanZ.update(measurement: Float(sensorData.accelerometer.z)))
            )

            // ✅ Apply low-pass and complementary filter for gyro and accelerometer
            if let prevAccel = previousAccelerometerData, let prevGyro = previousGyroscopeData {
                sensorData.accelerometer = applyLowPassFilter(newData: sensorData.accelerometer, prevData: prevAccel)
                sensorData.gyroscope = applyLowPassFilter(newData: sensorData.gyroscope, prevData: prevGyro)
            }

            // ✅ Complementary filter for motion stability
            fusedData = applyComplementaryFilter(accel: sensorData.accelerometer, gyro: sensorData.gyroscope, dt: updateInterval)

            previousAccelerometerData = sensorData.accelerometer
            previousGyroscopeData = sensorData.gyroscope

            // ✅ Throttle updates
            let currentTime = Date().timeIntervalSince1970
            if currentTime - lastUpdateTime > updateInterval {
                DispatchQueue.main.async {
                    self.sensorData = sensorData
                }
                lastUpdateTime = currentTime
            }
        } catch {
            print("❌ Failed to decode sensor data: \(error)")
        }
    }

    // ✅ Low-pass filter
    private func applyLowPassFilter(newData: SensorValues, prevData: SensorValues) -> SensorValues {
        return SensorValues(
            x: alpha * newData.x + (1 - alpha) * prevData.x,
            y: alpha * newData.y + (1 - alpha) * prevData.y,
            z: alpha * newData.z + (1 - alpha) * prevData.z
        )
    }

    // ✅ Complementary filter
    private func applyComplementaryFilter(accel: SensorValues, gyro: SensorValues, dt: Double) -> SensorValues {
        let filteredX = filterAlpha * (gyro.x * dt) + (1 - filterAlpha) * accel.x
        let filteredY = filterAlpha * (gyro.y * dt) + (1 - filterAlpha) * accel.y
        let filteredZ = filterAlpha * (gyro.z * dt) + (1 - filterAlpha) * accel.z
        return SensorValues(x: filteredX, y: filteredY, z: filteredZ)
    }

    func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        print("WebSocket connection closed.")
    }
}

// ✅ Kalman Filter Class
class KalmanFilter {
    private var q: Float // Process noise covariance
    private var r: Float // Measurement noise covariance
    private var x: Float // Value
    private var p: Float // Estimation error covariance
    private var k: Float // Kalman gain

    init(q: Float, r: Float, initialValue: Float) {
        self.q = q
        self.r = r
        self.x = initialValue
        self.p = 1
        self.k = 0
    }

    func update(measurement: Float) -> Float {
        // Predict
        p = p + q

        // Update
        k = p / (p + r)
        x = x + k * (measurement - x)
        p = (1 - k) * p

        return x
    }
}
