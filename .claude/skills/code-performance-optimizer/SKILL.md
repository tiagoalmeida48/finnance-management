---
name: code-performance-optimizer
description: Diagnose and optimize application performance without changing behavior. Use when users ask to improve speed, reduce latency, lower CPU or memory usage, shrink bundle size, or investigate bottlenecks ("performance", "otimizar performance", "lentidao", "gargalo", "profiling", "memory leak", "slow query", "bundle grande").
---

# Code Performance Optimizer

Apply a measurement-first workflow to optimize performance with low regression risk.

## Non-Negotiable Rules

- Measure before and after each optimization.
- Preserve behavior, public contracts, and correctness.
- Optimize confirmed bottlenecks only.
- Prefer the simplest change that reaches the target.
- Validate with lint, tests, and build.

## Workflow

1. Define target and budget:
   - Capture explicit goals (for example: p95 latency, render time, memory cap, bundle size).
   - When no target exists, propose baseline plus target threshold.
2. Capture a reproducible baseline:
   - Define scenario, inputs, and data volume.
   - Run relevant profiler/benchmark for the stack.
   - Record top bottlenecks and current metrics.
3. Select optimization strategy:
   - Prioritize algorithm and data-structure improvements.
   - Remove redundant work, repeated I/O, and unnecessary renders.
   - Use cache/memoization only with clear invalidation rules.
   - Reduce allocation and object churn in hot paths.
4. Implement in small, reversible slices:
   - Change one bottleneck at a time.
   - Keep code readable and avoid over-engineering.
5. Validate and compare:
   - Re-run the same benchmark scenario.
   - Report absolute and percentage deltas.
   - Run lint/tests/build and smoke-test affected flows.
6. Report outcome:
   - What changed and why.
   - Before/after metrics.
   - Tradeoffs, risks, and next bottlenecks.

## Tactics by Symptom

### High Latency

- Remove N+1 requests/queries and batch operations.
- Push filtering and aggregation closer to the data source.
- Precompute stable derived values used repeatedly.

### High CPU

- Replace expensive loop patterns with indexed lookup structures.
- Hoist invariant computations out of loops.
- Debounce/throttle expensive event handlers.

### High Memory

- Release large references as soon as possible.
- Process large payloads in chunks or streams.
- Reuse buffers/objects in tight loops when safe.

### Frontend

- Split bundles and lazy-load non-critical routes.
- Memoize expensive selectors/components with stable dependencies.
- Virtualize large lists and tables.
- Move heavy work off the main thread when justified.

### Backend

- Add indexes validated by real query plans.
- Reuse pooled resources (connections, clients, workers).
- Enforce pagination and sane limits on unbounded endpoints.

## Definition of Done

- Target metric improved with reproducible evidence.
- Functional behavior preserved in tests and smoke checks.
- Build/lint/test validation completed or explicitly documented.
- Remaining optimization opportunities prioritized by impact.

## Resources

- Use `references/performance-optimization-checklist.md` as the execution checklist.
