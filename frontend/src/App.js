import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import logo from "./assets/logo.png";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import "./App.css";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

function App() {
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
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
      const response = await fetch(
        `http://localhost:5000/performance?url1=${encodeURIComponent(
          url1
        )}&url2=${encodeURIComponent(url2)}`
      );
      const data = await response.json();

      if (response.ok) {
        setResult(data.results);
      } else {
        setError(
          data.error || "Error occurred while fetching performance data."
        );
      }
    } catch (err) {
      setError("Failed to fetch performance data.");
    }
  };

  const getChartData = (label, url1Value, url2Value, colors) => ({
    labels: ["URL 1", "URL 2"],
    datasets: [
      {
        label,
        data: [url1Value, url2Value],
        backgroundColor: colors,
        borderColor: colors.map((color) => color.replace("0.6", "1")),
        borderWidth: 1,
      },
    ],
  });

  const renderTableRow = (metric, url1Value, url2Value) => (
    <tr className="bg-light border-b text-center">
      <td className="p-3">{metric}</td>
      <td className="p-3">{url1Value}</td>
      <td className="p-3">{url2Value}</td>
    </tr>
  );

  const generateAnalysis = () => {
    if (!result) return [];
  
    const { url1, url2 } = result;
    const analysis = [];
  
    // Compare Response Time
    if (parseInt(url1.responseTime) < parseInt(url2.responseTime)) {
      analysis.push({
        title: "Response Time",
        description: "URL 1 has a faster response time, indicating quicker load speeds.",
      });
    } else {
      analysis.push({
        title: "Response Time",
        description: "URL 2 has a faster response time, making it more responsive.",
      });
    }
  
    // Compare CPU Usage
    if (url1.cpuUsage.user < url2.cpuUsage.user) {
      analysis.push({
        title: "CPU Usage",
        description: "URL 1 uses less CPU resources, which is more efficient under load.",
      });
    } else {
      analysis.push({
        title: "CPU Usage",
        description: "URL 2 uses less CPU resources, indicating better performance scalability.",
      });
    }
  
    // Compare Memory Usage
    const url1Memory = parseFloat(url1.memoryUsage.rss.replace("MB", "").trim());
    const url2Memory = parseFloat(url2.memoryUsage.rss.replace("MB", "").trim());
    if (url1Memory < url2Memory) {
      analysis.push({
        title: "Memory Usage",
        description: "URL 1 consumes less memory, making it lighter for the system.",
      });
    } else {
      analysis.push({
        title: "Memory Usage",
        description: "URL 2 consumes less memory, ideal for resource-constrained environments.",
      });
    }
  
    return analysis;
  };
  

  return (
    <div className="App p-6 bg-background min-h-screen">
      <div className="text-center">
        <img src={logo} alt="Logo" className="mx-auto mb-4 w-24 h-24" />
      </div>
      <h1 className="text-3xl font-bold mb-6 text-center text-dark">
        Compare Performance of two web applications
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto border-4 border-black text-dark"
        style={{ outline: "4px solid black", outlineOffset: "-4px" }} // Agrega un efecto "caricatura"
      >
        <div className="mb-4">
          <label className="block text-dark font-bold">
            Enter the first URL:
          </label>
          <input
            type="text"
            value={url1}
            onChange={(e) => setUrl1(e.target.value)}
            className="w-full p-2 border-4 border-black rounded bg-background"
            placeholder="Enter the first URL"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-dark font-bold">
            Enter the second URL:
          </label>
          <input
            type="text"
            value={url2}
            onChange={(e) => setUrl2(e.target.value)}
            className="w-full p-2 border-4 border-black rounded bg-background"
            placeholder="Enter the second URL"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-dark text-white p-2 rounded-lg border-2 border-black hover:bg-green transition hover:text-dark font-bold hover:border-dark"
        >
          Compare
        </button>
      </form>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-center mb-6 text-dark">
            Performance Comparison
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-lg font-semibold text-center mb-4 text-dark">
                Response Time (ms)
              </h3>
              <Bar
                data={getChartData(
                  "Response Time",
                  parseInt(result.url1.responseTime.replace("ms", "")),
                  parseInt(result.url2.responseTime.replace("ms", "")),
                  ["rgba(75,192,192,0.6)", "rgba(153,102,255,0.6)"]
                )}
                options={{ responsive: true }}
              />
            </div>

            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-lg font-semibold text-center mb-4">
                CPU Usage (%)
              </h3>
              <Bar
                data={getChartData(
                  "CPU Usage",
                  result.url1.cpuUsage.user,
                  result.url2.cpuUsage.user,
                  ["rgba(255,99,132,0.6)", "rgba(255,159,64,0.6)"]
                )}
                options={{ responsive: true }}
              />
            </div>

            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-lg font-semibold text-center mb-4">
                Memory Usage (MB)
              </h3>
              <Bar
                data={getChartData(
                  "Memory Usage",
                  parseFloat(
                    result.url1.memoryUsage.rss.replace("MB", "").trim()
                  ),
                  parseFloat(
                    result.url2.memoryUsage.rss.replace("MB", "").trim()
                  ),
                  ["rgba(153,102,255,0.6)", "rgba(75,192,192,0.6)"]
                )}
                options={{ responsive: true }}
              />
            </div>
          </div>
          <div className="bg-white p-6 shadow rounded-lg mt-6">
  <h3 className="text-lg font-bold text-dark mb-4">Performance Analysis</h3>
  <ul className="list-none pl-0">
    {generateAnalysis().map((item, index) => (
      <li key={index} className="mb-4">
        <strong>{item.title}:</strong> {item.description}
      </li>
    ))}
  </ul>
</div>


          <h3 className="text-lg font-bold mt-10 mb-4 text-center">
            Detailed Results
          </h3>

          <table className="w-full bg-white shadow rounded-lg text-left">
            <thead>
              <tr className="bg-dark text-white text-center">
                <th className="p-3 bg-lightgreen">Metric</th>
                <th className="p-3">URL 1</th>
                <th className="p-3">URL 2</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRow(
                "Response Time",
                result.url1.responseTime,
                result.url2.responseTime
              )}
              {renderTableRow(
                "Status Code",
                result.url1.statusCode,
                result.url2.statusCode
              )}
              {renderTableRow(
                "CPU Usage",
                result.url1.cpuUsage.user,
                result.url2.cpuUsage.user
              )}
              {renderTableRow(
                "Memory Usage",
                result.url1.memoryUsage.rss,
                result.url2.memoryUsage.rss
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
