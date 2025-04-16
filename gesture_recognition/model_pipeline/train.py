import sys
import os

# Add project root to system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle

from model_pipeline.data_loader import load_data
from model_pipeline.model import LSTMModel

# Define path to the data directory
current_dir = os.path.dirname(__file__)
data_dir = os.path.abspath(os.path.join(current_dir, '../../server/data'))

# Load data
X, y = load_data(data_dir, time_steps=100)

# Encode string labels to integers
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

# Ensure the model_pipeline directory exists
os.makedirs('model_pipeline', exist_ok=True)

# Save the encoder to use for prediction later
with open("model_pipeline/label_encoder.pkl", "wb") as f:
    pickle.dump(label_encoder, f)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Convert to tensors
X_train = torch.tensor(X_train, dtype=torch.float32)
y_train = torch.tensor(y_train, dtype=torch.long)
X_test = torch.tensor(X_test, dtype=torch.float32)
y_test = torch.tensor(y_test, dtype=torch.long)

# Model parameters
input_size = 9
hidden_size = 128
num_classes = len(set(y))
time_steps = 100

# Initialize model
model = LSTMModel(input_size, hidden_size, num_classes, time_steps)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training loop
num_epochs = 20
for epoch in range(num_epochs):
    model.train()
    outputs = model(X_train)
    loss = criterion(outputs, y_train)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 5 == 0:
        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}")

# Save model weights
torch.save(model.state_dict(), "model_pipeline/model.pth")

print("✅ Training complete. Model and label encoder saved.")
