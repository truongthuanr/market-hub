---
id: 001
title: Project Overview
status: Proposed
date: 2025-01-07
---

# ADR 001: Project Overview


## Context

This project is a marketplace platform built as multiple services with
separate domains for identity, commerce, catalog, payments, and a user-facing
UI. The primary goals are to keep domain logic isolated, enable independent
delivery per service, and provide a cohesive user experience across the
system. Key constraints include clear service boundaries, stable inter-service
contracts, and consistent auth and error handling across services. Shared
infrastructure includes MySQL, Redis for caching/sessions, and Kafka (KRaft)
for domain events.

## Decision

Adopt a service-oriented architecture with the following main services:
- Auth service
- Commerce service
- Catalog service
- Payment service
- UI

Each service owns its domain data and business logic. The UI aggregates data
via service APIs, and shared conventions (auth, error formats, logging) are
documented and enforced across services.

## Consequences

Benefits include clearer ownership, improved parallel development, and the
ability to scale or evolve services independently. Trade-offs include added
integration overhead, cross-service coordination, and the need for stronger
contract testing. Follow-up ADRs should define API contracts, auth strategy,
and service-to-service communication patterns.

There are main services: 
- Auth service
- Commerce service
- Catalog service
- Payment service
- UI
