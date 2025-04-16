import os
import pandas as pd
from gesture_recognition.model_pipeline.data_loader import load_data
from gesture_recognition.model_pipeline.model import LSTMModel
import torch
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
from gesture_recognition.model_pipeline.utils import save_model
import config

def interactive_labeling():
    print("Welcome to the Interactive Learning Mode.")
    label = input("Please enter the label (O, I, L, U, V): ").strip().upper()
    if label not in ["O", "I", "L", "U", "V"]:
        print("Invalid label. Please try again.")
        return
    
    print("Please upload your new sensor data CSV file:")
    file_path = input("Enter the file path: ").strip()
    
    if not os.path.exists(file_path):
        print("File not found. Please check the file path and try again.")
        return

    # Create the folder if it doesn't exist
    folder_path = os.path.join(config.DATA_DIR, label)
    os.makedirs(folder_path, exist_ok=True)

    # Save the new file in the appropriate label folder
    new_filename = f"{label}_{len(os.listdir(folder_path)) + 1}.csv"
    new_file_path = os.path.join(folder_path, new_filename)
    df = pd.read_csv(file_path)
    df.to_csv(new_file_path, index=False)
    print(f"Data saved to {new_file_path}")

    # After saving the new data, retrain the model
    retrain_model()

def retrain_model():
    # Load existing data with new data included
    X, y = load_data(config.DATA_DIR, time_steps=config.TIME_STEPS)

    # Encode labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y)

    # Save the label encoder for prediction
    with open(config.LABEL_ENCODER_PATH, 'wb') as f:
        pickle.dump(label_encoder, f)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Convert to tensors
    X_train = torch.tensor(X_train, dtype=torch.float32)
    y_train = torch.tensor(y_train, dtype=torch.long)
    X_test = torch.tensor(X_test, dtype=torch.float32)
    y_test = torch.tensor(y_test, dtype=torch.long)

    # Initialize model
    input_size = X_train.shape[2]
    hidden_size = 128
    num_classes = len(set(y))
    model = LSTMModel(input_size, hidden_size, num_classes, config.TIME_STEPS)

    # Loss and optimizer
    criterion = torch.nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # Train model
    model.train()
    num_epochs = 20
    for epoch in range(num_epochs):
        outputs = model(X_train)
        loss = criterion(outputs, y_train)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 5 == 0:
            print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}")

    # Save the updated model
    save_model(model)

def save_model(model):
    torch.save(model.state_dict(), config.MODEL_PATH)
    print("✅ Model retrained and saved successfully.")
