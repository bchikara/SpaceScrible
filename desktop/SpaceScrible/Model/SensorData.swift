import Foundation

// ✅ SensorValues to store x, y, z values
struct SensorValues: Codable, Equatable {
    var x: Double
    var y: Double
    var z: Double
}

// ✅ SensorData with updated keys to match incoming JSON
struct SensorData: Codable, Equatable {
    var accelerometer: SensorValues
    var gyroscope: SensorValues

    enum CodingKeys: String, CodingKey {
        case accelerometer = "accelerometerData"
        case gyroscope = "gyroscopeData"
    }
}

// ✅ Wrapper to match the incoming WebSocket data
struct SensorWrapper: Codable {
    var type: String
    var data: SensorData
}
