
"""SearchNet discrete-event performance simulation engine.

Educational model only; this is not a live network emulator.

Assumptions:
- Requests arrive using a seeded Poisson arrival process.
- Servers have finite parallel processing slots and a queue.
- Regional latency values are illustrative configuration assumptions.
- Regional server failure can redirect distributed requests to a backup.
- Network-link failure is represented by independent modeled packet loss.
- A request succeeds only when its server is available and all modeled
  packets are delivered.
"""

import heapq
import math
import random
import statistics

from config import (
    ARCHITECTURES,
    BASE_LATENCY_MS,
    CENTRAL_REGION,
    DEFAULT_REQUESTS,
    DEFAULT_SEED,
    DEFAULT_TRAFFIC_INTENSITY,
    FAILED_LINK_PACKET_LOSS,
    FAILOVER_DELAY_MS,
    FAILURE_SCENARIOS,
    MAX_REQUESTS,
    PACKETS_PER_REQUEST,
    REGIONS,
    SERVER_CAPACITY,
    SERVER_PROCESSING_MS,
    TRAFFIC_INTENSITY_RPS,
)


def percentile(values, percent):
    """Return the nearest-rank percentile, or 0.0 for an empty list."""
    if not 0 <= percent <= 100:
        raise ValueError("percent must be between 0 and 100")

    if not values:
        return 0.0

    ordered = sorted(values)
    rank = max(1, math.ceil((percent / 100.0) * len(ordered)))
    return float(ordered[min(rank - 1, len(ordered) - 1)])


def _make_arrivals(requests_count, traffic_rps, seed):
    """Generate cumulative exponential inter-arrival times in milliseconds."""
    rng = random.Random(seed)
    current_time_seconds = 0.0
    arrivals = []

    for request_id in range(1, requests_count + 1):
        current_time_seconds += rng.expovariate(traffic_rps)
        arrivals.append({
            "request_id": request_id,
            "arrival_ms": current_time_seconds * 1000.0,
        })

    return arrivals


def _schedule_server(arrival_ms, region, servers, processing_ms):
    """Schedule work on the earliest available processing slot."""
    worker_times = servers[region]
    available_ms = heapq.heappop(worker_times)

    start_ms = max(arrival_ms, available_ms)
    finish_ms = start_ms + processing_ms

    heapq.heappush(worker_times, finish_ms)
    return start_ms, finish_ms


def _nearest_backup(source_region):
    """Choose the closest configured alternative region."""
    candidates = [candidate for candidate in REGIONS
                  if candidate != source_region]

    if not candidates:
        raise ValueError("No backup region is configured")

    return min(
        candidates,
        key=lambda destination: BASE_LATENCY_MS[source_region][destination],
    )


def _validate_inputs(
    architecture,
    region,
    failure,
    requests_count,
    seed,
    traffic_intensity,
    failover_enabled,
):
    """Validate public simulation inputs before generating a workload."""
    if architecture not in ARCHITECTURES:
        raise ValueError("Invalid architecture")

    if region not in REGIONS:
        raise ValueError("Invalid region")

    if failure not in FAILURE_SCENARIOS:
        raise ValueError("Invalid failure scenario")

    # bool is a subclass of int in Python, so explicitly reject it.
    if (
        isinstance(requests_count, bool)
        or not isinstance(requests_count, int)
        or not 1 <= requests_count <= MAX_REQUESTS
    ):
        raise ValueError(
            f"requests_count must be an integer between 1 and {MAX_REQUESTS}"
        )

    if (
        isinstance(seed, bool)
        or not isinstance(seed, int)
    ):
        raise ValueError("seed must be an integer")

    if traffic_intensity not in TRAFFIC_INTENSITY_RPS:
        raise ValueError("Invalid traffic intensity")

    if not isinstance(failover_enabled, bool):
        raise ValueError("failover_enabled must be a boolean")

    if not isinstance(PACKETS_PER_REQUEST, int) or PACKETS_PER_REQUEST < 1:
        raise ValueError("PACKETS_PER_REQUEST must be a positive integer")

    if not 0.0 <= FAILED_LINK_PACKET_LOSS <= 1.0:
        raise ValueError("FAILED_LINK_PACKET_LOSS must be between 0 and 1")

    if not isinstance(FAILOVER_DELAY_MS, (int, float)) or FAILOVER_DELAY_MS < 0:
        raise ValueError("FAILOVER_DELAY_MS must be non-negative")

    for name, value in (
        ("Centralized", SERVER_CAPACITY.get("Centralized")),
        ("Distributed", SERVER_CAPACITY.get("Distributed")),
    ):
        if isinstance(value, bool) or not isinstance(value, int) or value < 1:
            raise ValueError(f"Invalid server capacity for {name}")

    for name, value in (
        ("Centralized", SERVER_PROCESSING_MS.get("Centralized")),
        ("Distributed", SERVER_PROCESSING_MS.get("Distributed")),
    ):
        if not isinstance(value, (int, float)) or value < 0:
            raise ValueError(f"Invalid processing time for {name}")


def run_simulation(
    architecture="Distributed",
    region="india",
    failure="Normal",
    requests_count=DEFAULT_REQUESTS,
    seed=DEFAULT_SEED,
    traffic_intensity=DEFAULT_TRAFFIC_INTENSITY,
    failover_enabled=True,
):
    """Run one reproducible SearchNet simulation.

    `region` is the user/source region. Centralized requests are served
    from CENTRAL_REGION. Distributed requests normally use the source region.

    A regional server failure is a persistent scenario for this experiment,
    not a timed event with a simulated outage and restoration timeline.
    """

    _validate_inputs(
        architecture,
        region,
        failure,
        requests_count,
        seed,
        traffic_intensity,
        failover_enabled,
    )

    traffic_rps = TRAFFIC_INTENSITY_RPS[traffic_intensity]
    if not isinstance(traffic_rps, (int, float)) or traffic_rps <= 0:
        raise ValueError("Configured traffic arrival rate must be positive")

    arrivals = _make_arrivals(requests_count, traffic_rps, seed)

    # Pre-generate random values for every request. The same request ID
    # therefore receives the same jitter and packet-loss draws when the
    # seed and request count match, even if scenarios have different outcomes.
    jitter_rng = random.Random(seed + 100_003)
    loss_rng = random.Random(seed + 200_003)

    jitter_by_request = {
        request["request_id"]: jitter_rng.uniform(0.0, 8.0)
        for request in arrivals
    }

    packet_delivery_draws = {
        request["request_id"]: [
            loss_rng.random() for _ in range(PACKETS_PER_REQUEST)
        ]
        for request in arrivals
    }

    worker_count = SERVER_CAPACITY[architecture]
    processing_ms = float(SERVER_PROCESSING_MS[architecture])

    # Every region has its own worker pool. The centralized architecture
    # uses only the central region's pool; distributed failover uses a
    # backup region's pool.
    servers = {
        current_region: [0.0] * worker_count
        for current_region in REGIONS
    }

    for worker_times in servers.values():
        heapq.heapify(worker_times)

    request_results = []
    successful_latencies = []
    successful_requests = 0
    failed_requests = 0
    recovered_requests = 0
    total_packets_sent = 0
    total_packets_delivered = 0
    successful_completion_times_ms = []
    recovery_delays_ms = []

    for request in arrivals:
        request_id = request["request_id"]
        arrival_ms = request["arrival_ms"]

        original_target = (
            CENTRAL_REGION if architecture == "Centralized" else region
        )
        target_region = original_target

        network_latency_ms = float(BASE_LATENCY_MS[region][target_region])
        recovery_latency_ms = 0.0
        server_available = True
        was_rerouted = False

        # The selected region is persistently unavailable for this scenario.
        if failure == "Regional Server Failure":
            if architecture == "Centralized":
                server_available = False
            elif failover_enabled:
                target_region = _nearest_backup(region)
                network_latency_ms = float(
                    BASE_LATENCY_MS[region][target_region]
                )
                recovery_latency_ms = float(FAILOVER_DELAY_MS)
                was_rerouted = True
            else:
                server_available = False

        # Count packet transmission separately from request success.
        # A regional server failure does not itself drop network packets;
        # it makes the target service unavailable unless failover is used.
        packet_draws = packet_delivery_draws[request_id]
        if failure == "Network Link Failure":
            packets_delivered = sum(
                draw >= FAILED_LINK_PACKET_LOSS for draw in packet_draws
            )
        else:
            packets_delivered = PACKETS_PER_REQUEST

        packets_sent = PACKETS_PER_REQUEST
        total_packets_sent += packets_sent
        total_packets_delivered += packets_delivered

        request_delivered = (
            server_available and packets_delivered == packets_sent
        )

        jitter_ms = float(jitter_by_request[request_id])
        queue_wait_ms = 0.0
        response_latency_ms = None
        completion_ms = None

        if request_delivered:
            # The persistent failure scenario means each rerouted request
            # incurs the modeled failover delay; it is not a one-time event.
            service_arrival_ms = (
                arrival_ms
                + network_latency_ms
                + recovery_latency_ms
                + jitter_ms
            )

            start_ms, completion_ms = _schedule_server(
                service_arrival_ms,
                target_region,
                servers,
                processing_ms,
            )

            queue_wait_ms = start_ms - service_arrival_ms

            response_latency_ms = (
                network_latency_ms
                + recovery_latency_ms
                + jitter_ms
                + queue_wait_ms
                + processing_ms
            )

            successful_requests += 1
            successful_latencies.append(response_latency_ms)
            successful_completion_times_ms.append(completion_ms)

            if was_rerouted:
                recovered_requests += 1
                recovery_delays_ms.append(recovery_latency_ms)
        else:
            failed_requests += 1

        request_results.append({
            "request_id": request_id,
            "source_region": region,
            "served_by": target_region if request_delivered else None,
            "arrival_time_ms": round(arrival_ms, 3),
            "network_latency_ms": round(network_latency_ms, 3),
            "recovery_latency_ms": round(recovery_latency_ms, 3),
            "jitter_ms": round(jitter_ms, 3),
            "queue_wait_ms": round(queue_wait_ms, 3),
            "processing_time_ms": round(processing_ms, 3),
            "response_latency_ms": (
                round(response_latency_ms, 3)
                if response_latency_ms is not None else None
            ),
            "completion_time_ms": (
                round(completion_ms, 3)
                if completion_ms is not None else None
            ),
            "packets_sent": packets_sent,
            "packets_delivered": packets_delivered,
            "delivered": request_delivered,
            "failover_used": was_rerouted and request_delivered,
        })

    if successful_latencies:
        average_latency = statistics.mean(successful_latencies)
        median_latency = statistics.median(successful_latencies)
        p95_latency = percentile(successful_latencies, 95)
    else:
        average_latency = 0.0
        median_latency = 0.0
        p95_latency = 0.0

    packet_delivery_ratio = (
        100.0 * total_packets_delivered / total_packets_sent
        if total_packets_sent else 0.0
    )

    availability = 100.0 * successful_requests / requests_count

    # Include the full generated workload in the measurement interval.
    # The final arrival is included even if that request failed; successful
    # work can extend the interval beyond the final arrival.
    first_arrival_ms = arrivals[0]["arrival_ms"]
    last_arrival_ms = arrivals[-1]["arrival_ms"]
    last_completion_ms = max(successful_completion_times_ms, default=0.0)
    experiment_end_ms = max(last_arrival_ms, last_completion_ms)
    experiment_duration_ms = max(0.0, experiment_end_ms - first_arrival_ms)

    throughput = (
        successful_requests / (experiment_duration_ms / 1000.0)
        if experiment_duration_ms > 0 else 0.0
    )

    return {
        "architecture": architecture,
        "region": region,
        "failure": failure,
        "traffic_intensity": traffic_intensity,
        "failover_enabled": failover_enabled,
        "metrics": {
            "average_latency_ms": round(average_latency, 2),
            "median_latency_ms": round(median_latency, 2),
            "p95_latency_ms": round(p95_latency, 2),
            "throughput_requests_per_second": round(throughput, 2),
            "packet_delivery_ratio_percent": round(packet_delivery_ratio, 2),
            "packet_delivery_ratio": round(packet_delivery_ratio, 2),
            "availability_percent": round(availability, 2),
            "availability": round(availability, 2),
            "successful_requests": successful_requests,
            "failed_requests": failed_requests,
            "recovered_requests": recovered_requests,
            # This is the average configured failover delay paid by
            # successfully rerouted requests, not actual outage recovery time.
            "estimated_recovery_latency_ms": round(
                statistics.mean(recovery_delays_ms)
                if recovery_delays_ms else 0.0,
                2,
            ),
            "modeled_failover_delay_ms": round(
                statistics.mean(recovery_delays_ms)
                if recovery_delays_ms else 0.0,
                2,
            ),
            "total_packets_sent": total_packets_sent,
            "total_packets_delivered": total_packets_delivered,
            "packets_sent": total_packets_sent,
            "packets_delivered": total_packets_delivered,
            "experiment_duration_ms": round(experiment_duration_ms, 3),
        },
        "request_results": request_results,
        "methodology": {
            "traffic_model": "Seeded Poisson arrivals",
            "queue_model": "Earliest-available parallel worker slots",
            "latency_model": (
                "Network delay + failover delay when rerouted + jitter "
                "+ queue wait + server processing"
            ),
            "packet_model": (
                f"{PACKETS_PER_REQUEST} packets per request; packet loss "
                "is independent per packet in the Network Link Failure "
                "scenario; all packets must arrive for request success"
            ),
            "availability_definition": (
                "Successful requests divided by all requested operations"
            ),
            "throughput_definition": (
                "Successful requests divided by the simulated interval "
                "from the first arrival through the last arrival or "
                "successful completion, whichever is later"
            ),
            "recovery_definition": (
                "Recovered requests are successful requests routed to a "
                "backup region. The reported recovery latency is the mean "
                "configured failover delay paid by those requests; it is "
                "not a measured outage recovery duration."
            ),
            "failure_model": (
                "Scenario-based persistent failure; no timed failure onset "
                "or restoration event is simulated."
            ),
        },
        "note": (
            "Educational Python simulation, not a live network measurement. "
            "Results depend on configured assumptions and must be reported "
            "separately from Cisco Packet Tracer observations."
        ),
    }
