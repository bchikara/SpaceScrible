# 🚀 SpaceScrible

**SpaceScrible** is a cross-platform real-time motion tracking app. It captures **sensor data** (gyroscope + accelerometer) from a mobile device and transmits it to a **desktop app** using **WebSockets** via a Node.js backend.

> 📱 Mobile (React Native) → 🌐 Node WebSocket Server → 🖥️ Desktop Client (Swift/macOS)

---

## ✨ Features

- 📲 Capture real-time gyroscope & accelerometer data from mobile sensors
- 🔁 Stream sensor data to a connected desktop device via WebSocket
- 📈 Swift desktop app to visualize incoming sensor events
- 🧠 Modular, layered folder structure for clean separation
- ✅ Built with production best practices

---

## 📁 Folder Structure

\`\`\`
SpaceScrible/
├── .gitignore
├── README.md
├── mobile/           # React Native Mobile App (TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── utils/         # WebSocketService.ts
│   │   └── views/
│   └── App.tsx
│
├── server/     # Node.js WebSocket Server
│   ├── server.js
│   └── package.json
│
└── desktop/          # macOS Swift App (Xcode Project)
    ├── Controller/
    ├── Model/
    ├── View/
    ├── WebSocketManager.swift
    └── SpaceScribIe.xcodeproj
\`\`\`

---

## ⚙️ Getting Started

### ✅ Prerequisites

- Node.js + npm
- Xcode (for Swift/macOS app)
- React Native CLI + Android/iOS simulator
- All devices connected to same local network (for WebSocket to work)

---

### 🧱 1. Start the WebSocket Server (Node.js)

\`\`\`bash
cd SpaceScribeServer
npm install
node server.js
\`\`\`

> By default, the server runs on \`ws://<your-local-ip>:8080\`.  
> Use \`ifconfig\` or \`ipconfig\` to get the IP to plug into your client apps.

---

### 📱 2. Run the React Native Mobile App

\`\`\`bash
cd ../SpaceScribe
npm install
npx react-native run-ios     # or: run-android
\`\`\`

**Update \`WebSocketService.ts\` with the correct IP:**

\`\`\`ts
const socket = new WebSocket('ws://192.168.x.x:8080');
\`\`\`

---

### 💻 3. Run the macOS Swift App (Desktop)

1. Open \`SpaceScribIe.xcodeproj\` in Xcode
2. Build and run the project
3. Make sure \`WebSocketManager.swift\` is using the **same IP and port** as the server

---

## 🧪 How It Works

- The React Native app reads gyroscope & accelerometer values
- It sends this data every \`x\` milliseconds to the Node.js WebSocket server
- The macOS app connects to the server and listens for incoming data
- Data is displayed in real time in the desktop app console

---

## 🛠️ Tech Stack

| Platform       | Tech                            |
|----------------|---------------------------------|
| Backend        | Node.js, WebSocket              |
| Mobile         | React Native, TypeScript        |
| Desktop/macOS  | Swift, URLSessionWebSocketTask  |
| Protocol       | WebSocket                       |

---

## 💡 Future Ideas

- Add a visual plot/graph to desktop app (e.g. SwiftCharts or SwiftUI Canvas)
- Create a dashboard UI to replay sensor motion trails
- Store session data and export to CSV/JSON
- Add authentication or connection status indicator

---

## 🤝 Contribution

Contributions are welcome! Feel free to open an issue or pull request.

\`\`\`bash
git clone https://github.com/bchikara/SpaceScrible.git
\`\`\`

---

