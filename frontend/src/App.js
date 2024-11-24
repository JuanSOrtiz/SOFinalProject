import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import './App.css'; // Importa el archivo CSS

// Registra los componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function App() {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!url1 || !url2) {
      setError("Please provide two valid URLs.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/performance?url1=${encodeURIComponent(url1)}&url2=${encodeURIComponent(url2)}`);
      const data = await response.json();

      if (response.ok) {
        setResult(data.results);
      } else {
        setError(data.error || 'Error occurred while fetching performance data.');
      }
    } catch (err) {
      setError('Failed to fetch performance data.');
    }
  };

  // Función para preparar los datos de la gráfica de tiempo de respuesta (barras)
  const getResponseTimeData = () => {
    if (!result) return {};

    const url1ResponseTime = result.url1.responseTime.replace('ms', '');
    const url2ResponseTime = result.url2.responseTime.replace('ms', '');

    return {
      labels: ['URL 1', 'URL 2'],
      datasets: [
        {
          label: 'Response Time (ms)',
          data: [parseInt(url1ResponseTime), parseInt(url2ResponseTime)],
          backgroundColor: ['rgba(75,192,192,0.6)', 'rgba(153,102,255,0.6)'], // Colores diferentes para cada URL
          borderColor: ['rgba(75,192,192,1)', 'rgba(153,102,255,1)'],
          borderWidth: 1
        }
      ]
    };
  };

  // Función para preparar los datos de la gráfica de uso de CPU (barras)
  const getCpuUsageData = () => {
    if (!result) return {};

    return {
      labels: ['URL 1', 'URL 2'],
      datasets: [
        {
          label: 'CPU Usage (%)',
          data: [result.url1.cpuUsage.user, result.url2.cpuUsage.user],
          backgroundColor: ['rgba(255,99,132,0.6)', 'rgba(255,159,64,0.6)'],
          borderColor: ['rgba(255,99,132,1)', 'rgba(255,159,64,1)'],
          borderWidth: 1
        }
      ]
    };
  };

  // Función para preparar los datos de la gráfica de uso de memoria (barras)
  const getMemoryUsageData = () => {
    if (!result) return {};

    return {
      labels: ['URL 1', 'URL 2'],
      datasets: [
        {
          label: 'Memory Usage (RSS in MB)',
          data: [
            parseFloat(result.url1.memoryUsage.rss.replace('MB', '').trim()),
            parseFloat(result.url2.memoryUsage.rss.replace('MB', '').trim())
          ],
          backgroundColor: ['rgba(153,102,255,0.6)', 'rgba(75,192,192,0.6)'],
          borderColor: ['rgba(153,102,255,1)', 'rgba(75,192,192,1)'],
          borderWidth: 1
        }
      ]
    };
  };

  return (
    <div className="App">
      <h1>Compare Performance of Two URLs</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>First URL:</label>
          <input
            type="text"
            value={url1}
            onChange={(e) => setUrl1(e.target.value)}
            placeholder="Enter the first URL"
            required
          />
        </div>

        <div>
          <label>Second URL:</label>
          <input
            type="text"
            value={url2}
            onChange={(e) => setUrl2(e.target.value)}
            placeholder="Enter the second URL"
            required
          />
        </div>

        <button type="submit">Compare</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div>
          <h2>Performance Comparison:</h2>

          <div className="chart-container">
            <div>
              <h3>Response Time Comparison (ms):</h3>
              <Bar data={getResponseTimeData()} options={{ responsive: true }} />
            </div>

            <div>
              <h3>CPU Usage Comparison (%):</h3>
              <Bar data={getCpuUsageData()} options={{ responsive: true }} />
            </div>

            <div>
              <h3>Memory Usage (RSS) Comparison (MB):</h3>
              <Bar data={getMemoryUsageData()} options={{ responsive: true }} />
            </div>
          </div>

          <div>
            <h3>Detailed Results:</h3>
            <div>
              <h4>URL 1: {result.url1.url}</h4>
              <p>Response Time: {result.url1.responseTime}</p>
              <p>Status Code: {result.url1.statusCode}</p>
              <p>CPU Usage: {JSON.stringify(result.url1.cpuUsage)}</p>
              <p>Memory Usage (RSS): {result.url1.memoryUsage.rss}</p>
            </div>

            <div>
              <h4>URL 2: {result.url2.url}</h4>
              <p>Response Time: {result.url2.responseTime}</p>
              <p>Status Code: {result.url2.statusCode}</p>
              <p>CPU Usage: {JSON.stringify(result.url2.cpuUsage)}</p>
              <p>Memory Usage (RSS): {result.url2.memoryUsage.rss}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
