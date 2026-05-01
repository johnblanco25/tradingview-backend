const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Signal = require('./models/Signal');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// Ruta principal - sirve el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Obtener todas las señales
app.get('/api/signals', async (req, res) => {
    try {
        const signals = await Signal.find().sort({ timestamp: -1 }).limit(50);
        res.json(signals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Guardar nueva señal
app.post('/api/signals', async (req, res) => {
    try {
        const { action, symbol, lots } = req.body;
        
        const signal = new Signal({
            action,
            symbol: symbol.toUpperCase(),
            lots: parseFloat(lots)
        });
        
        await signal.save();
        res.json({ success: true, signal });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
  console.log(`✅ MongoDB: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
});
