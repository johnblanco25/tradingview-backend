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
// Endpoint para recibir alertas de TradingView
app.post('/api/tradingview-webhook', async (req, res) => {
    try {
        const alerta = req.body;
        
        // Extraer información de la alerta
        let action = 'buy';
        let symbol = 'EURUSD';
        let lots = 0.01;
        
        // Si la alerta viene en formato texto
        if (alerta.message) {
            const mensaje = alerta.message.toLowerCase();
            if (mensaje.includes('sell')) action = 'sell';
            if (mensaje.includes('buy')) action = 'buy';
            
            // Extraer símbolo (ej: EURUSD, BTCUSD)
            const simboloMatch = mensaje.match(/[A-Z]{6}/);
            if (simboloMatch) symbol = simboloMatch[0];
            
            // Extraer lotes (ej: lots:0.05)
            const lotsMatch = mensaje.match(/lots[:=]?\s*(\d+\.?\d*)/i);
            if (lotsMatch) lots = parseFloat(lotsMatch[1]);
        }
        
        // Si la alerta viene en formato JSON
        if (alerta.action) action = alerta.action;
        if (alerta.symbol) symbol = alerta.symbol;
        if (alerta.lots) lots = alerta.lots;
        
        // Guardar la señal en la base de datos
        const Signal = require('./models/Signal');
        const signal = new Signal({ action, symbol: symbol.toUpperCase(), lots });
        await signal.save();
        
        console.log(`📊 Nueva señal recibida: ${action.toUpperCase()} ${symbol} ${lots} lotes`);
        
        res.json({ 
            success: true, 
            message: `Señal ${action.toUpperCase()} ${symbol} recibida`,
            signal 
        });
        
    } catch (error) {
        console.error('Error al procesar webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para ver el estado (opcional)
app.get('/api/tradingview-status', (req, res) => {
    res.json({
        status: 'online',
        endpoint: '/api/tradingview-webhook',
        method: 'POST',
        format: 'JSON o Texto plano',
        example: {
            action: 'buy',
            symbol: 'EURUSD',
            lots: 0.01
        }
    });
});
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
  console.log(`✅ MongoDB: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
});
