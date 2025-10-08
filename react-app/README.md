# Tribalprint React

Application React (Vite + TypeScript + Tailwind) qui remplace progressivement le site statique Tribalprint et se connecte au backend Tribal Ops pour centraliser les commandes, les réglages et les fichiers clients.

## Prérequis

- Node.js ≥ 18
- npm 9+ (fourni avec Node 18)
- Accès au dépôt `tribal-ops` pour lancer l’API locale

## Installation

1. Installer les dépendances de l’application React :
	```bash
	npm install
	```
2. Installer les dépendances du serveur Tribal Ops :
	```bash
	cd ../tribal-ops/server
	npm install
	cd -
	```

## Configuration de l’API Tribal Ops

L’application s’appuie sur l’API Tribal Ops exposée en local (par défaut sur `http://localhost:8787/api`).

1. Copier l’exemple d’environnement si besoin et vérifier la variable :
	```bash
	cp .env.local.example .env.local # si vous créez un nouveau fichier
	```
	Dans `.env.local` :
	```ini
	VITE_TRIBAL_OPS_API=http://localhost:8787/api
	```
2. Démarrer le serveur Tribal Ops :
	```bash
	cd ../tribal-ops/server
	npm run dev
	```
	Le serveur sert l’API REST (`/api/v1/*`) et héberge les fichiers envoyés sur `http://localhost:8787/uploads/*`.

## Lancer l’application

Dans ce dossier :

```bash
npm run dev
```

Par défaut, Vite démarre sur `http://localhost:5173`. Les pages produits utilisent la variable `VITE_TRIBAL_OPS_API` :

- Si l’API est configurée, les formulaires appellent `tribal-ops` pour :
  - récupérer la configuration (catalogue, livraisons, paramètres),
  - créer une commande,
  - téléverser les fichiers via le composant `UploadBox` (stockés dans `tribal-ops/server/uploads`).
- Si l’API est absente, la navigation continue en mode « fallback » : l’utilisateur voit un résumé de commande et un lien WhatsApp.

## Build de production

```bash
npm run build
```

Le bundle est produit dans `dist/`.

## Flux de fichiers téléversés

Les pages qui demandent un fichier (plaquettes, cartes, flyers, mugs, etc.) s’appuient sur le hook `useSingleFileUpload`. Au moment de la sélection :

1. Le fichier est envoyé vers `/v1/uploads` si l’API est joignable.
2. La commande inclut l’URL et les métadonnées de ce fichier.
3. En cas d’échec ou d’API absente, l’application retombe sur le comportement historique (le fichier n’est pas partagé mais la commande reste possible).

Les fichiers enregistrés en local sont visibles dans `tribal-ops/server/uploads`. Pensez à nettoyer ce dossier durant les tests.