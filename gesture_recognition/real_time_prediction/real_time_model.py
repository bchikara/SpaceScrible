import torch
import numpy as np
from model_pipeline.model import LSTMModel
from model_pipeline.config import MODEL_PATH
import pickle
import os

# Load label encoder
label_encoder_path = os.path.join(os.path.dirname(MODEL_PATH), "label_encoder.pkl")
with open(label_encoder_path, "rb") as f:
    label_encoder = pickle.load(f)

# Load model
model = LSTMModel(input_size=9, hidden_size=128, num_classes=len(label_encoder.classes_), time_steps=100)
model.load_state_dict(torch.load(MODEL_PATH))
model.eval()

def predict_gesture(sensor_window):
    """
    sensor_window: A list of 100x9 (time_steps x features) for one gesture window
    """
    if len(sensor_window) != 100 or len(sensor_window[0]) != 9:
        raise ValueError("Expected input shape (100, 9)")
    
    # Prepare input
    input_tensor = torch.tensor(np.array(sensor_window), dtype=torch.float32).unsqueeze(0)
    
    # Get prediction
    with torch.no_grad():
        output = model(input_tensor)
        predicted_class = torch.argmax(output, dim=1).item()
    
    predicted_label = label_encoder.inverse_transform([predicted_class])[0]
    return predicted_label
