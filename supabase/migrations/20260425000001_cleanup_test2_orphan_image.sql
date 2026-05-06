-- Migration: cleanup_test2_orphan_image
-- Date:      2026-04-25
--
-- BUG FIX : la fiche produit "TEST2" (id d25867c1-211b-49f2-8cfa-f23e5b4f6829)
-- avait image_url qui pointait vers un objet absent du bucket product-images
-- (chemin team/c95f09db_260425_002.jpg). Confirmé via curl HEAD : HTTP 400 sur
-- l'URL, donc objet inexistant côté Storage.
--
-- Conséquence : l'élément <img> rendait l'icône "image cassée" du browser
-- dans les pages /superadmin, /backoffice et /team — pas grave fonctionnellement
-- mais visuellement préoccupant et signe d'un état DB incohérent.
--
-- Cette migration nettoie UNIQUEMENT cette ligne. Le nettoyage en masse des
-- autres image_url orphelines (issues de l'ancien projet Lovable, uploads ratés,
-- objets manuellement supprimés du bucket) sera traité dans une migration
-- dédiée, après audit complet de la table products.
--
-- Côté frontend, un onError handler a été ajouté sur tous les <img> qui
-- consomment products.image_url, pour qu'à l'avenir une URL orpheline affiche
-- proprement le placeholder Package au lieu de l'icône cassée du browser.

UPDATE public.products
SET image_url = NULL
WHERE id = 'd25867c1-211b-49f2-8cfa-f23e5b4f6829'
  AND image_url = 'https://bvnxxijorhtucxhymaqo.supabase.co/storage/v1/object/public/product-images/team/c95f09db_260425_002.jpg';
