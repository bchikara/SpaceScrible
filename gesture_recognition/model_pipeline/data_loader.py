import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

def load_data(data_dir, time_steps=100):
    X = []
    y = []
    labels = ["O", "I", "L", "U", "V"]
    
    # Iterate over each letter folder
    for label in labels:
        folder_path = os.path.join(data_dir, label)
        for filename in os.listdir(folder_path):
            if filename.endswith('.csv'):
                # Read CSV file
                df = pd.read_csv(os.path.join(folder_path, filename))
                
                # Extract relevant features (using all columns)
                features = preprocess_sensor_data(df)
                features = pad_or_truncate(features, time_steps)

                print(f"Label: {label}, Features Shape: {features.shape}")
                print(features[:5])  # Print the first 5 rows for inspection
               
                # Append data and labels
                X.append(features)
                y.append(label)

    
    # Convert to numpy arrays
    X = np.array(X)
    y = np.array(y)
    
    # Standardize feature values
    scaler = StandardScaler()
    X = scaler.fit_transform(X.reshape(-1, X.shape[-1])).reshape(X.shape)
    
    return X, y
            

def preprocess_sensor_data(df):
    # Use the exact 21 features in the same order as real-time
    selected_columns = [
        'acc_x', 'acc_y', 'acc_z',
        'gyro_x', 'gyro_y', 'gyro_z',
        'mag_x', 'mag_y', 'mag_z'
    ]
    
    # Check for missing columns
    for col in selected_columns:
        if col not in df.columns:
            df[col] = 0.0  # fill missing columns with zeros

    return df[selected_columns].values



def pad_or_truncate(features, time_steps):
    if features.shape[0] > time_steps:
        return features[:time_steps]  # Truncate if data exceeds time_steps
    elif features.shape[0] < time_steps:
        padding = np.zeros((time_steps - features.shape[0], features.shape[1]))
        return np.vstack([features, padding])  # Pad if data is shorter
    return features
