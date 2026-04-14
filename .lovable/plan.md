

# Formule de prix dynamique avec taux de change réel

## Formule actuelle vs nouvelle

- **Avant** : `Prix € = RMB × 3`
- **Après** : `Prix € = (RMB / taux_de_change_RMB_EUR) × 3`

Exemple : 10 RMB, taux 7.5 → (10 / 7.5) × 3 = 4.00 €

## Plan technique

### 1. Créer une edge function `exchange-rate`
- Appelle une API gratuite (ex: `https://open.er-api.com/v6/latest/EUR`) pour récupérer le taux EUR→CNY
- Cache le résultat en base (table `exchange_rates`) pour éviter les appels excessifs et garder une trace
- Retourne le taux CNY/EUR du jour

### 2. Créer une table `exchange_rates`
- Colonnes : `id`, `date` (unique), `rate_cny_eur` (numeric), `created_at`
- RLS : lecture pour team/backoffice/admin/superadmin, insertion via la fonction edge uniquement

### 3. Modifier `TeamProductForm.tsx`
- Au montage du composant, appeler la edge function pour récupérer le taux du jour
- Remplacer `parsedPrice * 3` par `(parsedPrice / taux) * 3`
- Afficher le taux utilisé sous le champ prix (ex: "Taux du jour : 1 EUR = 7.50 CNY")

### 4. Modifier `FicheProduit.tsx`
- Remplacer le fallback `price * 3` par la même logique utilisant le taux stocké (ou le `sell_price` déjà calculé en base)
- En pratique le `sell_price` est déjà calculé à l'enregistrement, donc ce fallback sera rarement utilisé

### Fichiers impactés
- `supabase/functions/exchange-rate/index.ts` (nouveau)
- Migration SQL pour la table `exchange_rates`
- `src/components/TeamProductForm.tsx`
- `src/components/FicheProduit.tsx`

