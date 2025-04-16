import torch
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from model_pipeline.model import LSTMModel
import torch.optim as optim
import torch.nn as nn

# Load existing model
model = LSTMModel(input_size=9, hidden_size=128, num_classes=5, time_steps=100)
model.load_state_dict(torch.load("model.pth"))
model.train()

def retrain_model():
    # Load old and new data
    old_data = load_data('old_data.csv')  # Path to the old data
    new_data = load_data('new_sensor_data.csv')  # Path to the new data

    # Combine datasets
    X_combined = np.concatenate((old_data[0], new_data[0]), axis=0)
    y_combined = np.concatenate((old_data[1], new_data[1]), axis=0)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_combined, y_combined, test_size=0.2, random_state=42)

    # Convert to tensor
    X_train = torch.tensor(X_train, dtype=torch.float32)
    y_train = torch.tensor(y_train, dtype=torch.long)
    X_test = torch.tensor(X_test, dtype=torch.float32)
    y_test = torch.tensor(y_test, dtype=torch.long)

    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # Training loop
    num_epochs = 20
    for epoch in range(num_epochs):
        outputs = model(X_train)
        loss = criterion(outputs, y_train)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 5 == 0:
            print(f"Epoch [{epoch + 1}/{num_epochs}], Loss: {loss.item()}")

    # Save the updated model
    torch.save(model.state_dict(), "model.pth")
    print("Model retrained and saved.")

def load_data(file_path):
    data = pd.read_csv(file_path)

    X = data.iloc[:, :-1].values  # Features (all columns except the last)
    y = data.iloc[:, -1].values   # Labels (last column)
    return X, y
