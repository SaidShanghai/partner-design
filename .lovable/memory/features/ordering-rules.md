---
name: Ordering quantity & shipping rules
description: Min 3m, steps of 3, max 27m self-service, weight-based shipping formula
type: feature
---
- Minimum order: 3 meters, increments of 3m only (3, 6, 9 … 27)
- Above 27m: hide add-to-cart, show "contactez-nous" link
- Shipping formula (RMB): <500g → 150 RMB; ≥500g → 150 + ceil((weight-500)/500)×45
- Convert RMB→EUR using latest exchange_rates row
- Pricing table shown below each product card with fabric/shipping/total/price-per-meter
