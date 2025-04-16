import torch
import torch.nn as nn

class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes, time_steps):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.time_steps = time_steps
        
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)
    
    def forward(self, x):
        # x shape: (batch_size, time_steps, input_size)
        h0 = torch.zeros(1, x.size(0), self.hidden_size).to(x.device)  # Initial hidden state
        c0 = torch.zeros(1, x.size(0), self.hidden_size).to(x.device)  # Initial cell state
        
        lstm_out, _ = self.lstm(x, (h0, c0))  # LSTM output
        lstm_out = lstm_out[:, -1, :]  # Use the last timestep output
        out = self.fc(lstm_out)  # Output layer
        return out
