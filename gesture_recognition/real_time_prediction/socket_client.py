import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import asyncio
import websockets
import json
import numpy as np
from real_time_prediction.real_time_model import predict_gesture


sensor_buffer = []

async def receive_sensor_data():
    uri = "ws://192.168.0.117:8080"

    async with websockets.connect(uri) as websocket:
        print("✅ Connected to WebSocket server")

        while True:
            try:
                message = await websocket.recv()

                parsed = json.loads(message)

                if parsed.get("type") == "sensorData":
                    sensor_data = parsed["data"]

                    acc = sensor_data.get("accelerometerData", {})
                    gyro = sensor_data.get("gyroscopeData") or {}
                    mag = sensor_data.get("magnetometerData", {})

                    # ✅ Only keep 9 features
                    sensor_sample = [
                        acc.get("x", 0.0), acc.get("y", 0.0), acc.get("z", 0.0),
                        gyro.get("x", 0.0), gyro.get("y", 0.0), gyro.get("z", 0.0),
                        mag.get("x", 0.0), mag.get("y", 0.0), mag.get("z", 0.0),
                    ]

                    sensor_buffer.append(sensor_sample)

                    if len(sensor_buffer) >= 100:
                        input_data = np.array(sensor_buffer[-100:])  # shape: (100, 9)
                        prediction = predict_gesture(input_data)
                        print("🤖 Predicted Gesture:", prediction)

            except websockets.exceptions.ConnectionClosedError as e:
                print("❌ WebSocket closed:", e)
                break
            except Exception as e:
                print("❌ Error:", e)

if __name__ == "__main__":
    asyncio.run(receive_sensor_data())
