# YT Skipper — Guide de publication sur les stores

## Structure du projet

```
yt-skipper-store/
├── manifest.json         → Configuration MV3 (Chrome + Firefox)
├── browser-polyfill.js   → Compatibilité chrome.* / browser.*
├── content.js            → Script injecté sur YouTube
├── popup.html            → Interface de configuration
├── popup.js              → Logique de la popup
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── store-assets/         → (voir section assets ci-dessous)
├── PRIVACY_POLICY.md     → Politique de confidentialité
└── SUBMISSION_GUIDE.md   → Ce fichier
```

---

## Avant de soumettre — Checklist

- [ ] Modifier `"id": "yt-skipper@yourname.dev"` dans `manifest.json` avec votre vrai domaine/email
- [ ] Héberger `PRIVACY_POLICY.md` sur une URL publique (GitHub Pages, votre site, etc.)
- [ ] Préparer les assets visuels pour les stores (voir ci-dessous)
- [ ] Tester l'extension en mode développeur sur Chrome ET Firefox

---

## Assets visuels à préparer

### Chrome Web Store (obligatoires)
| Asset | Dimensions | Format | Notes |
|-------|-----------|--------|-------|
| Icône principale | 128×128 px | PNG | Déjà incluse |
| Capture d'écran | 1280×800 ou 640×400 px | PNG/JPG | Min. 1, max. 5 |
| Vignette promotionnelle *(optionnel)* | 440×280 px | PNG/JPG | Affiché sur la page store |

### Firefox AMO (obligatoires)
| Asset | Dimensions | Format | Notes |
|-------|-----------|--------|-------|
| Icône | 128×128 px | PNG | Déjà incluse |
| Capture d'écran | Min. 700px de large | PNG/JPG | Min. 1 |

---

## Description prête à l'emploi

### Titre
```
YT Skipper
```

### Résumé court (132 caractères max pour Chrome)
```
Automatically skip the first seconds of every YouTube video. Fully configurable from 1 to 60 seconds.
```

### Description longue

```
YT Skipper automatically advances YouTube videos past their opening seconds — no more waiting through identical intros, recaps, or slow starts.

FEATURES
• Skips the first N seconds of every YouTube video automatically
• Fully configurable: set any delay from 1 to 60 seconds
• Enable or disable the extension with one click
• Discreet on-screen notification when a skip happens
• Works with YouTube's single-page navigation (no page reload needed)
• Zero tracking, zero ads, zero external connections

PRIVACY
YT Skipper stores only your chosen skip delay and on/off state, locally in your browser. No data is ever collected or transmitted anywhere.

PERMISSIONS
• youtube.com — to detect video playback and advance the playhead
• storage — to remember your preferred skip duration

Open source and free to use.
```

### Catégorie suggérée
- Chrome: **Productivity**
- Firefox: **Browsing / User interface customization**

### Tags suggérés
`youtube`, `productivity`, `video`, `skip`, `intro`, `autoplay`

---

## Création du compte développeur

### Chrome Web Store
1. Aller sur https://chrome.google.com/webstore/devconsole
2. Se connecter avec un compte Google
3. Payer les frais uniques d'inscription : **5 USD**
4. Accepter les conditions du programme développeur

### Firefox AMO
1. Aller sur https://addons.mozilla.org/fr/developers/
2. Créer un compte Mozilla (gratuit)
3. Cliquer sur **Submit a New Add-on**

---

## Processus de soumission

### Chrome Web Store
1. Créer un ZIP du dossier `yt-skipper-store/` (sans les fichiers de la racine comme SUBMISSION_GUIDE.md)
2. Sur https://chrome.google.com/webstore/devconsole → **New Item**
3. Uploader le ZIP
4. Remplir titre, description, captures d'écran, URL de politique de confidentialité
5. Soumettre pour review → délai habituel : **1 à 3 jours ouvrables**

> ⚠️ Chrome exige une URL HTTPS publique pour la politique de confidentialité.

### Firefox AMO
1. Créer un ZIP du dossier `yt-skipper-store/`
2. Sur https://addons.mozilla.org/fr/developers/ → **Submit a New Add-on**
3. Choisir **On this site** (listing public) ou **By yourself** (unlisted)
4. Uploader le ZIP → Firefox peut demander le code source séparé pour review
5. Remplir les métadonnées
6. Délai de review : **quelques heures à quelques jours** selon la file d'attente

---

## Mise à jour future

Pour publier une mise à jour :
1. Incrémenter `"version"` dans `manifest.json` (ex. `"1.0.1"`)
2. Recréer le ZIP
3. Sur chaque store, uploader le nouveau ZIP dans la console développeur

---

## Ressources utiles

- [Chrome Web Store — Politique développeur](https://developer.chrome.com/docs/webstore/program-policies/)
- [Firefox AMO — Guide de soumission](https://extensionworkshop.com/documentation/publish/)
- [Manifest V3 — Documentation Chrome](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Manifest V3 — Documentation Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
