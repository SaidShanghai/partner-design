
## Module CRM — Back-office Admin

### 1. Base de données (migrations)
Créer les tables suivantes :
- **customers** — Clients (nom, email, téléphone, adresse, notes)
- **suppliers** — Fournisseurs (raison sociale, contact, email, téléphone, adresse, notes)
- **orders** — Commandes reçues (client, date, statut [en attente, confirmée, expédiée, livrée, annulée], total, notes)
- **order_items** — Lignes de commande (produit, quantité en mètres, prix unitaire, sous-total)
- **invoices** — Factures émises (n° facture, commande liée, date émission, date échéance, statut [brouillon, envoyée, payée], montant HT/TTC/TVA)
- **product_pricing** — Prix d'achat et de vente par produit (prix_achat, prix_vente, fournisseur, marge calculée)

### 2. Interface Admin — Onglet CRM (sidebar ou tabs)
Sections accessibles depuis un onglet **CRM** visible uniquement pour les admins :

- **📋 Commandes** — Liste des commandes, filtres par statut, détail avec lignes
- **👥 Clients** — Liste, fiche client, historique commandes
- **🏭 Fournisseurs** — Liste, coordonnées, produits associés
- **📦 Fiches produits** — Vue admin enrichie avec prix d'achat/vente et marge
- **🧾 Factures** — Génération, liste, statut de paiement
- **📊 Statistiques** — CA, top produits, graphiques (recharts)

### 3. Fonctionnalités clés
- Création/édition de commandes avec sélection client + produits
- Émission de factures PDF (numérotation auto)
- Calcul automatique des marges (prix vente - prix achat)
- Tableau de bord avec KPIs (CA du mois, commandes en cours, top clients)
- RLS sur toutes les tables (admin only)

### 4. Navigation
- Bouton **CRM** visible à gauche de "Ajouter un produit" (admin only)
- Ouvre une page `/admin/crm` avec navigation par onglets internes
