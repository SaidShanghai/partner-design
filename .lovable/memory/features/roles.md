---
name: Role-based auth system
description: Three roles (superadmin/admin/team) with dedicated routes and protected access
type: feature
---
- Roles stored in user_roles table with app_role enum (superadmin, admin, team, moderator, user)
- superadmin: /superadmin — full category tree CRUD
- admin: main site + /admin/crm
- team: /team — mobile-first category navigator, read-only
- s.elkharrouai@gmail.com auto-assigned superadmin via trigger on auth.users insert
- Login at /connexion redirects based on role after auth
- ProtectedRoute component guards /superadmin and /team
- categories table: id, name, parent_id, position — RLS allows public read, superadmin write
