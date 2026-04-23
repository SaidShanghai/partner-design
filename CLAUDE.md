# CLAUDE.md — Règles de ce projet

⚠️ **LIS CE FICHIER EN PREMIER À CHAQUE SESSION.** Il contient les invariants du projet.

## Identité du projet
- **Nom** : Textile Partner / keqiao.market
- **Stack** : Vite + React 18 + TypeScript + shadcn/ui + Supabase
- **Port dev** : 8081

## ⚠️ SOURCE DE VÉRITÉ — Infrastructure

### Supabase
- **PROJET CORRECT** : `textile-partner-europe`
- **REF PROJET** : `bvnxxijorhtucxhymaqo`
- **URL API** : `https://bvnxxijorhtucxhymaqo.supabase.co`
- **REGION** : eu-west-1 (Ireland / Dublin)
- **ORG** : TEXTILE PARTNER (slug: ooivtzrrrndefiaqhgvn — ce n'est PAS un ref projet)

🚨 **INTERDICTIONS ABSOLUES**
- ❌ NE JAMAIS pousser sur `fgynpwgmwogklarknpjx` (ancien projet Lovable, abandonné)
- ❌ NE JAMAIS confondre le slug org `ooivtzrrrndefiaqhgvn` avec un ref projet
- ❌ NE JAMAIS créer de nouveau projet Supabase sans validation explicite

✅ **AVANT TOUTE OPÉRATION SUPABASE (db push, migrations, dump)**
1. Vérifier : `cat supabase/.temp/project-ref` → doit afficher `bvnxxijorhtucxhymaqo`
2. Vérifier : `grep project_id supabase/config.toml` → doit afficher `bvnxxijorhtucxhymaqo`
3. Si divergence → STOP et signaler à l'utilisateur avant toute modif

### GitHub
- Repo : https://github.com/SaidShanghai/partner-design
- Branche principale : main

### Google Cloud (OAuth)
- Client : `keqiao-market-web`
- Client ID : `930855703284-3lh07oqj9b31jgjbqpo2ndeh1mshj9c2.apps.googleusercontent.com`
- Redirect URI prod : `https://bvnxxijorhtucxhymaqo.supabase.co/auth/v1/callback`
- Origines JS : `http://localhost:8081`

## Règles métier critiques

### Superadmin
- UN SEUL superadmin autorisé : `s.elkharrouai@gmail.com`
- **Triple condition** obligatoire (défense en profondeur) :
  1. `role === "superadmin"` dans user_roles
  2. `provider === "google"` dans auth.users.raw_app_meta_data
  3. `email === "s.elkharrouai@gmail.com"`
- Vérification à TROIS niveaux : SQL (trigger + is_superadmin()) + Edge Functions + Frontend

## Protocole de travail avec Claude Code

### Avant toute modification
1. **Diagnostic d'abord** (pas de code)
2. **Validation utilisateur** de la stratégie
3. **Backup si DB/migrations touchées**
4. **Code par étapes** (une couche à la fois)

### Changements DB
- TOUJOURS créer une migration dans `supabase/migrations/` (jamais de SQL ad-hoc)
- TOUJOURS faire un dump avant : `supabase db dump --linked -f backups/$(date +%Y%m%d_%H%M%S)_pre_migration.sql`
- TOUJOURS tester en local avant `supabase db push`

### Commandes courantes
- Dev : `npm run dev` (port 8081)
- Lint : `npm run lint`
- Build : `npm run build`
- Supabase local : `supabase start` / `supabase stop`

## Historique des galères (pour ne pas les répéter)
- **2026-04-22 nuit** : confusion slug org (`ooivtzrrrndefiaqhgvn`) vs ref projet (`bvnxxijorhtucxhymaqo`) → 6h perdues. Règle : toujours copier l'URL complète depuis le dashboard Supabase, jamais le slug d'org.
- **supabase/config.toml** : a historiquement pointé vers `fgynpwgmwogklarknpjx` (Lovable) au lieu du vrai projet. Fix appliqué le 2026-04-23.
- **.env.lovable.backup** : ancien backup Lovable tracké Git, supprimé le 2026-04-23 (git rm).
