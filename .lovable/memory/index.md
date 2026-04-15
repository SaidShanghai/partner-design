# Project Memory

## Core
Textile e-commerce site. French primary language with translation system. Supabase backend with RLS.
Product images must be full-frame (fabric covers 100% of image, no background visible).
Max 2 fold/drape styles across product images for visual consistency.
Each product must have a unique image — never duplicate images within a category.
Min order 3m, steps of 3m, max 27m self-service. Weight-based shipping formula.
Price format: "X,XX € le mètre" — never use "€/m" shorthand.

## Memories
- [Image generation rules](mem://design/product-images) — Full-frame fabric photos, fold consistency, no duplicates
- [Ordering & shipping rules](mem://features/ordering-rules) — Min 3m, 3m steps, 27m cap, shipping formula, pricing table
- [User roles](mem://features/roles) — Role-based access control setup
