
from backend.simulator import run_simulation


def test_normal_operation():
    result = run_simulation(
        architecture="Distributed",
        region="india",
        failure="Normal",
        requests_count=100,
        seed=42,
    )

    metrics = result["metrics"]

    assert metrics["successful_requests"] == 100
    assert metrics["failed_requests"] == 0
    assert metrics["availability"] == 100.0


def test_central_server_failure():
    result = run_simulation(
        architecture="Centralized",
        region="india",
        failure="Regional Server Failure",
        requests_count=100,
        seed=42,
    )

    metrics = result["metrics"]

    assert metrics["successful_requests"] == 0
    assert metrics["failed_requests"] == 100
    assert metrics["availability"] == 0.0


def test_distributed_failover():
    result = run_simulation(
        architecture="Distributed",
        region="europe",
        failure="Regional Server Failure",
        requests_count=100,
        seed=42,
        failover_enabled=True,
    )

    metrics = result["metrics"]

    # Europe is the failed region in this scenario.
    # Requests should be routed to a backup region.
    assert metrics["successful_requests"] > 0
    assert metrics["recovered_requests"] == metrics["successful_requests"]
    assert metrics["failed_requests"] == 100 - metrics["successful_requests"]
    assert metrics["modeled_failover_delay_ms"] == 50.0

    recovered = [
        request
        for request in result["request_results"]
        if request["failover_used"]
    ]

    assert len(recovered) == metrics["recovered_requests"]
    assert all(request["served_by"] != "europe" for request in recovered)


def test_distributed_without_failover():
    result = run_simulation(
        architecture="Distributed",
        region="europe",
        failure="Regional Server Failure",
        requests_count=100,
        seed=42,
        failover_enabled=False,
    )

    metrics = result["metrics"]

    assert metrics["successful_requests"] == 0
    assert metrics["failed_requests"] == 100
    assert metrics["recovered_requests"] == 0


def test_network_link_failure():
    result = run_simulation(
        architecture="Distributed",
        region="india",
        failure="Network Link Failure",
        requests_count=100,
        seed=42,
    )

    metrics = result["metrics"]

    assert metrics["packets_sent"] == 100 * 5
    assert metrics["packets_delivered"] <= metrics["packets_sent"]
    assert metrics["packet_delivery_ratio"] < 100.0
    assert metrics["successful_requests"] < 100
