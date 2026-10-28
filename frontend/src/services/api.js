// API service placeholder.

const API_BASE_URL = "http://127.0.0.1:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  // This function is used for GET requests.
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function checkHealth() {
  return request("/health");
}

export function getRegions() {
  return request("/regions");
}

export async function runSimulation(configuration) {
  const response = await fetch(`${API_BASE_URL}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(configuration),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Simulation failed");
  }

  return data;
}

export function getExperiment(id) {
  return request(`/experiments/${id}`);
}

export function getResultsCSVUrl(id) {
  return `${API_BASE_URL}/experiments/${id}/results.csv`;
}

export async function getExperiments() {
  return request("/experiments");
}
