
"""Central configuration for the SearchNet network simulator.

All latency values are illustrative model assumptions, not measured
real-world or Cisco Packet Tracer results.
"""

# Shared labels used by the website, Python simulator and Packet Tracer lab.
REGIONS = ["india", "europe", "usa"]

REGION_DISPLAY_NAMES = {
    "india": "India",
    "europe": "Europe",
    "usa": "USA",
}

ARCHITECTURES = ["Centralized", "Distributed"]

FAILURE_SCENARIOS = [
    "Normal",
    "Regional Server Failure",
    "Network Link Failure",
]

CENTRAL_REGION = "europe"

# Approximate one-way network latency in milliseconds.
# Rows represent source regions; columns represent destination regions.
BASE_LATENCY_MS = {
    "india": {
        "india": 20,
        "europe": 110,
        "usa": 210,
    },
    "europe": {
        "india": 110,
        "europe": 20,
        "usa": 130,
    },
    "usa": {
        "india": 210,
        "europe": 130,
        "usa": 20,
    },
}

# Illustrative server processing time per request, in milliseconds.
SERVER_PROCESSING_MS = {
    "Centralized": 35,
    "Distributed": 25,
}

# Maximum requests a server can process concurrently.
# Queueing occurs when all processing slots are busy.
SERVER_CAPACITY = {
    "Centralized": 8,
    "Distributed": 8,
}

# Traffic intensity presets: requests arriving per second.
TRAFFIC_INTENSITY_RPS = {
    "Low": 20,
    "Medium": 100,
    "High": 300,
}

# Defaults for a reproducible experiment.
DEFAULT_REQUESTS = 500
DEFAULT_SEED = 42
DEFAULT_TRAFFIC_INTENSITY = "Medium"

# Network failure assumptions.
# These represent the probability that a modeled packet is lost on
# a failed link, not empirically measured packet-loss rates.
FAILED_LINK_PACKET_LOSS = 0.20

# Fraction of requests that cannot be delivered when a link is failed
# and no alternate route is available.
FAILED_LINK_REQUEST_LOSS = 0.20

# Modelled failover delay, in milliseconds.
FAILOVER_DELAY_MS = 50

# Packet-level abstraction: number of modeled packets per request.
PACKETS_PER_REQUEST = 5

# Maximum duration allowed for a simulation request.
MAX_REQUESTS = 10000
