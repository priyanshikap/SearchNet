"""Simulator tests placeholder."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from simulator import run_simulation


def test_simulation_is_reproducible():
    first = run_simulation(
        architecture="Distributed",
        region="india",
        failure="Normal",
        requests_count=100,
        seed=42,
    )

    second = run_simulation(
        architecture="Distributed",
        region="india",
        failure="Normal",
        requests_count=100,
        seed=42,
    )

    assert first == second


def test_distributed_latency_is_lower():
    centralized = run_simulation(
        architecture="Centralized",
        region="india",
        failure="Normal",
        requests_count=100,
        seed=42,
    )

    distributed = run_simulation(
        architecture="Distributed",
        region="india",
        failure="Normal",
        requests_count=100,
        seed=42,
    )

    assert (
        distributed["metrics"]["average_latency_ms"]
        < centralized["metrics"]["average_latency_ms"]
    )


def test_request_count():
    result = run_simulation(
        architecture="Distributed",
        region="usa",
        failure="Normal",
        requests_count=50,
        seed=42,
    )

    assert len(result["request_results"]) == 50
