const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // <-- Esto permite servir archivos estáticos como index.html

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error:', err));

// Ruta principal - sirve el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Para guardar señales (opcional - si quieres probar más tarde)
let signals = [];

app.get('/api/signals', (req, res) => {
    res.json(signals);
});

app.post('/api/signals', (req, res) => {
    const signal = req.body;
    signal.id = Date.now();
    signal.timestamp = new Date().toISOString();
    signals.unshift(signal);
    if (signals.length > 50) signals.pop();
    res.json({ success: true, signal });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${__dirname}`);
});
