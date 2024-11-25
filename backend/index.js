const express = require('express');
const axios = require('axios');
const os = require('os');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Habilitar CORS
app.use(cors());

// Middleware para registrar las solicitudes
app.use(morgan('dev'));

// Función para medir rendimiento de una URL
const measurePerformance = async (url) => {
    const startTime = Date.now();
    
    try {
        const response = await axios.get(url);
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        // Obtener uso de CPU y memoria
        const cpuUsage = process.cpuUsage();
        const memoryUsage = process.memoryUsage();

        return {
            url,
            responseTime: `${executionTime}ms`,
            statusCode: response.status,
            cpuUsage: cpuUsage,
            memoryUsage: {
                rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            }
        };
    } catch (error) {
        return {
            url,
            error: 'Error measuring performance',
            message: error.message
        };
    }
};

// Endpoint para medir el rendimiento de dos URLs
app.get('/performance', async (req, res) => {
    const url1 = req.query.url1;
    const url2 = req.query.url2;

    if (!url1 || !url2) {
        return res.status(400).json({ error: 'Please provide two valid URLs to test performance' });
    }

    try {
        // Ejecutar ambas solicitudes de manera asíncrona
        const [result1, result2] = await Promise.all([measurePerformance(url1), measurePerformance(url2)]);

        res.json({
            message: 'Performance analyzed successfully',
            results: {
                url1: result1,
                url2: result2
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error measuring performance',
            error: error.message
        });
    }
});

// Iniciar servidor en el puerto 3000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.use(cors({
    origin: 'http://localhost:8080'  // Solo permite solicitudes de este origen
}));