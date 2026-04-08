# Cashia — React Base Project

Proyecto React minimalista sin librerías externas. Solo React + Vite con SWC.

## Inicio rápido

```bash
cd cashia
npm install
npm run dev
```

## Estructura

```
cashia/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Button/         # Button.jsx + Button.module.css
│   │   ├── Layout/         # Layout.jsx + Layout.module.css
│   │   └── Navbar/         # Navbar.jsx + Navbar.module.css
│   ├── hooks/
│   │   ├── useFetch.js     # Fetch con abort + estado
│   │   ├── useLocalStorage.js
│   │   └── useTheme.js     # Dark/light mode
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   └── NotFound.jsx
│   ├── router/
│   │   └── index.jsx       # Router SPA propio (sin librerías)
│   ├── styles/
│   │   ├── variables.css   # Design tokens (colores, espaciado, tipografía)
│   │   └── global.css      # Reset + utilidades globales
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Características

- **Router propio** — History API nativa, sin `react-router-dom`
- **Temas** — Dark/light mode con `prefers-color-scheme` + persistencia
- **CSS Modules** — Estilos encapsulados por componente, sin colisiones
- **Design tokens** — Variables CSS centralizadas en `variables.css`
- **Hooks reutilizables** — `useFetch`, `useLocalStorage`, `useTheme`
- **Sin dependencias extra** — Solo `react`, `react-dom` y `vite`

## Alias de importación

El alias `@` apunta a `src/`:

```js
import { Button } from '@/components/Button/Button'
import { useTheme } from '@/hooks/useTheme'
```
