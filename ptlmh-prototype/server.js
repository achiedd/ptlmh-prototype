const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
// Inisialisasi WebSocket Server dan attach ke server HTTP
const wss = new WebSocket.Server({ server });

// Serve static files (Frontend HTML/CSS/JS yang sudah dibuat)
app.use(express.static(path.join(__dirname, '')));

// ==========================================
// Simulasi IoT Gateway & Telemetri
// (Pada implementasi nyata, ini diganti dengan
// MQTT Client yang menerima data dari ESP32)
// ==========================================
setInterval(() => {
    // Membuat payload data sensor IoT
    const payload = {
        type: 'telemetry',
        data: {
            debit: (0.85 + (Math.random() * 0.04 - 0.02)).toFixed(2),
            level: (1.20 + (Math.random() * 0.02 - 0.01)).toFixed(2),
            rpm: Math.floor(1500 + (Math.random() * 10 - 5)),
            temp: Math.floor(45 + (Math.random() * 2 - 1)),
            voltage: Math.floor(380 + (Math.random() * 4 - 2)),
            current: Math.floor(45 + (Math.random() * 2 - 1)),
            freq: (50.00 + (Math.random() * 0.04 - 0.02)).toFixed(2),
            power: parseFloat((24.5 + (Math.random() * 0.5 - 0.25)).toFixed(1))
        },
        timestamp: new Date().toISOString()
    };

    const payloadString = JSON.stringify(payload);

    // Broadcast ke semua web client (Dashboard) yang terhubung
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payloadString);
        }
    });
}, 3000); // Broadcast setiap 3 detik

// Handle koneksi client baru
wss.on('connection', (ws) => {
    console.log('🔌 New client connected to IoT Dashboard WebSocket');
    ws.send(JSON.stringify({ type: 'status', message: 'Connected to PLTMH IoT Gateway' }));
    
    ws.on('close', () => {
        console.log('❌ Client disconnected');
    });
});

// Menjalankan Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Backend Server & Static File Host running on http://localhost:${PORT}`);
    console.log(`✅ WebSocket Telemetry Server running on ws://localhost:${PORT}`);
    console.log(`\n=> [Panduan]: Buka browser dan arahkan ke http://localhost:${PORT} untuk melihat dashboard.`);
});
