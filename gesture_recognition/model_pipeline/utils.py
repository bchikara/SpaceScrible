import numpy as np
from sklearn.preprocessing import StandardScaler

def standardize_features(X):
    scaler = StandardScaler()
    return scaler.fit_transform(X)

def pad_or_truncate(features, time_steps):
    if features.shape[0] > time_steps:
        return features[:time_steps]  # Truncate if data exceeds time_steps
    elif features.shape[0] < time_steps:
        padding = np.zeros((time_steps - features.shape[0], features.shape[1]))
        return np.vstack([features, padding])  # Pad if data is shorter
    return features
