

## Plan : Créer le compte opérateur et activer la capture mobile

### 1. Créer le compte team@asialinkltd.com
- Créer l'utilisateur via l'API d'administration backend avec l'email `team@asialinkltd.com` et le mot de passe `Keqiao1974$`
- Insérer le rôle `team` dans `user_roles` pour ce nouvel utilisateur
- Activer l'auto-confirmation pour que le compte soit utilisable immédiatement (puis désactiver après)

### 2. Ajouter les permissions RLS pour le rôle team
Migration SQL :
- Policy INSERT sur `products` pour le rôle `team`
- Policy INSERT sur `storage.objects` (bucket `product-images`) pour le rôle `team`

### 3. Ajouter le formulaire de capture mobile dans /team
- Nouveau composant `TeamProductForm.tsx` : formulaire plein écran mobile-first
  - Photo (input avec `capture="environment"` → ouvre directement la caméra)
  - Nom du tissu
  - Prix (optionnel)
  - Catégorie pré-remplie (celle où l'opérateur se trouve)
- Modifier `Team.tsx` : ajouter un bouton flottant "📷 Ajouter" en bas de l'écran qui ouvre le formulaire

### Résultat
L'opérateur se connecte sur **partner-design.lovable.app/connexion** avec `team@asialinkltd.com` / `Keqiao1974$`, navigue dans les catégories, et peut photographier et enregistrer des tissus directement depuis son téléphone.

