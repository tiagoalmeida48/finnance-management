# Performance Optimization Checklist

Use this checklist during implementation and before finalizing.

## 1) Scope and Baseline

- Define target metric and threshold (latency, CPU, memory, bundle size, throughput).
- Define reproducible scenario (same input, same load, same environment assumptions).
- Capture before metrics and keep raw numbers.
- Identify top bottlenecks from profiler/trace, not guesswork.

## 2) Optimization Selection

- Choose highest-impact bottleneck first.
- Confirm root cause with direct evidence.
- Prefer algorithmic improvements over micro-optimizations.
- Avoid broad refactors unrelated to measured bottlenecks.

## 3) Safe Implementation

- Keep each change small and isolated.
- Preserve external contracts and outputs.
- Add guardrails for extreme inputs where relevant.
- Keep readability and maintainability acceptable.

## 4) Verification

- Re-run exact same benchmark scenario.
- Compare before/after using absolute and percentage deltas.
- Run lint/tests/build.
- Execute smoke tests for impacted user flows.

## 5) Report

- List changed files and bottlenecks addressed.
- Include before/after metrics and method used to measure.
- Document tradeoffs introduced (memory vs CPU, caching complexity, etc.).
- List next optimization candidates with expected impact.
