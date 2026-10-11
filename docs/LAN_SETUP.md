# STACK UNO — Local Area Network (Wi-Fi) Setup Guide

## How STACK UNO Local Multiplayer Works
STACK UNO runs a self-contained local WebSocket server on the host machine. Players on the same Wi-Fi connect directly to the host's LAN IP address without requiring an external internet connection or cloud service.

---

## 1. Finding Your Host IP Address

### Windows
1. Open PowerShell or Command Prompt.
2. Run:
   ```powershell
   ipconfig
   ```
3. Look for **IPv4 Address** under your active Wi-Fi or Ethernet adapter (e.g., `192.168.1.50`).

### macOS / Linux
1. Open Terminal.
2. Run:
   ```bash
   ifconfig
   # or
   ip a
   ```
3. Locate `inet` for `en0` / `wlan0`.

---

## 2. Windows Firewall Setup
By default, Windows Defender Firewall may block inbound traffic to Node.js servers on local ports.
To allow connections:
1. Open PowerShell as Administrator.
2. Allow Port 3000:
   ```powershell
   New-NetFirewallRule -DisplayName "STACK UNO Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```
   Or allow `Node.js` when prompted by Windows Defender.

---

## 3. Router Client Isolation
Ensure your Wi-Fi router does not have "AP Isolation" or "Client Isolation" turned on. If enabled, wireless devices cannot communicate with each other on the local network.

---

## 4. Connecting from Mobile Devices
1. Ensure both the host computer and mobile devices are connected to the same Wi-Fi network.
2. Start the server on host:
   ```bash
   npm run dev:server
   ```
3. In the mobile app:
   - On the Home screen or Join Room screen, tap the Host IP field and enter the host address (e.g. `192.168.1.50:3000`).
   - Enter the 4-6 letter Room Code and tap **Join Room**.
