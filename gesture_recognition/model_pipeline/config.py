import os

# config.py
class Config:
    TIME_STEPS = 100
    HIDDEN_SIZE = 128
    NUM_CLASSES = 5
    NUM_EPOCHS = 20
    LEARNING_RATE = 0.001
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pth")
