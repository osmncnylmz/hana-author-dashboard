# Hana Author Dashboard

A small React 19 + TypeScript single-page app that browses **authors** and the **posts** they have
written, built as a frontend case study for Hana Travel.

> **What this actually is.** Despite the "dashboard" name, there is no backend, no authentication and
> no author management in the CRUD sense. The app is a read-mostly client for the public
> [JSONPlaceholder](https://jsonplaceholder.typicode.com) demo API: its `/users` are presented as
> authors and its `/posts` as their articles. It is a UI/state-management exercise, not a production
> CMS.
>
> **The app's strings are in Turkish.** Identifiers, file names, code comments, this README and the
> commit history are in English, but the string literals are Turkish throughout — user-facing copy
> (`Yazar Kadromuz`, `Profili İncele`, `Yayınla`, …) as well as `console.error` messages and thrown
> error text. There is no i18n layer.

---

## What it does

Two routes, wired with React Router:

| Route        | Component    | Behaviour |
| ------------ | ------------ | --------- |
| `/`          | `Home`       | Fetches `GET /users` on mount and renders one `UserCard` per author in a responsive grid. A search box filters the already-loaded list client-side by **author name or company name** (case-insensitive substring). Shows a spinner while loading, a dedicated empty state when nothing matches the query, and an error panel with a "Tekrar Dene" (retry) button that reloads the page if the request fails. |
| `/user/:id`  | `UserDetail` | Fires `GET /users/:id` and `GET /posts?userId=:id` in parallel via `Promise.all`, then renders the author's name, a company badge, the post count, a "new post" form and the list of posts. A back button uses `navigate(-1)`. |

### Components

- **`UserCard`** — author name, e-mail, company, a link through to `/user/:id`, and a star button that
  toggles the author in and out of the favourites list.
- **`PostForm`** — a controlled title/body form. It refuses to submit when either field is only
  whitespace, disables its inputs and shows a "Yayınlanıyor…" spinner while the submit promise is in
  flight, and clears both fields on success. If the `onSubmit` promise it is handed rejects, it logs
  the error, re-enables itself and keeps the draft — but note that the only caller in the app never
  rejects, so that path is unreachable in practice (see the caveat below).
- **`Loading`** — the shared spinner used by both pages.

### Favourites

`FavoritesProvider` holds an array of favourited author ids, hydrates it from `localStorage` under the
key `hana_author_favorites_v1` on first render, and writes it back on every change. Reads and writes
are wrapped in `try`/`catch`, and the hydrated value is checked with `Array.isArray` and narrowed to
numeric ids, so a store holding invalid JSON, a valid-but-wrong-shape value, or no usable storage at
all degrades to an empty list rather than crashing the app. The `useFavorites` hook throws if it is
called outside the provider.

Be aware of the current scope: the star on `UserCard` is the *only* place favourites surface. Nothing
filters the grid down to favourites, and there is no favourites page — the state is persisted and
ready, but not yet consumed anywhere else.

### A caveat about creating posts

`PostForm` submits to `POST /posts` on JSONPlaceholder. That endpoint is **faked**: it validates and
echoes the payload back with a hard-coded `id` of `101`, but it never stores anything. Because every
created post would therefore collide on `id: 101`, `UserDetail` overwrites the id with `Date.now()`
and prepends the post to its in-memory list. The new post is visible immediately and **disappears on
reload**. That is a property of the demo API, not a bug in the form.

The handler `UserDetail` passes to `PostForm` also swallows its own failure: it logs the error and
shows an `alert("Post eklenemedi.")`, but does not rethrow. From the form's point of view the submit
therefore always succeeds, so a failed `POST` still clears the draft. The form's own
keep-the-draft-on-rejection behaviour is real and covered by a test, but nothing in the shipped app
triggers it.

---

## Tech stack

| Concern         | Choice |
| --------------- | ------ |
| UI              | React 19 |
| Language        | TypeScript 5.9 (`strict`, `noUnusedLocals`, `noUnusedParameters`) |
| Build / dev     | Vite 7 |
| Styling         | Tailwind CSS 4 via `@tailwindcss/postcss`, configured CSS-first with `@theme` in `src/index.css` (there is no `tailwind.config.js` — Tailwind 4 does not need one) |
| Routing         | React Router 7 (`BrowserRouter`) |
| HTTP            | axios, through a single shared instance |
| Icons           | lucide-react |
| Server state    | `useEffect` + `useState` in the page components — no data-fetching library |
| Client state    | React Context (`FavoritesProvider`) + `localStorage` |
| Tests           | Vitest 3 + Testing Library, jsdom environment |
| Linting         | ESLint 9 flat config with typescript-eslint, react-hooks and react-refresh |

There is no state-management library, no service worker and no environment configuration. The API
base URL is hard-coded in `src/api/axiosInstance.ts`; there is no `.env` file to create.

---

## Quickstart

Requires **Node.js >= 22.12** and npm.

```bash
git clone https://github.com/osmncnylmz/hana-author-dashboard.git
cd hana-author-dashboard
npm install
npm run dev
```

Vite serves the app at <http://localhost:5173>. It talks to the public JSONPlaceholder API over the
network, so the first load needs an internet connection; there is no mock server and nothing to
configure.

To check out the production build locally:

```bash
npm run build
npm run preview
```

---

## Scripts

| Script                  | What it runs |
| ----------------------- | ------------ |
| `npm run dev`           | Vite dev server with HMR on port 5173. |
| `npm run build`         | `tsc -b` across the project references, then `vite build` into `dist/`. Type errors fail the build. |
| `npm run preview`       | Serves the built `dist/` output. |
| `npm run lint`          | ESLint over the repository (`dist/` and `coverage/` are ignored). |
| `npm test`              | Vitest, single run. |
| `npm run test:watch`    | Vitest in watch mode. |
| `npm run test:coverage` | Vitest with V8 coverage (text + lcov). |

---

## Project structure

```
.
├── .github/workflows/ci.yml   Lint, test and build on Node 22 and 24
├── index.html                 Vite entry document
├── public/favicon.svg
├── postcss.config.js          Tailwind 4 + autoprefixer
├── vite.config.ts             Vite plugins and the Vitest config
└── src
    ├── main.tsx               createRoot + StrictMode
    ├── App.tsx                FavoritesProvider > BrowserRouter > header + routes
    ├── index.css              Tailwind import, @theme tokens, a few component classes
    ├── api/axiosInstance.ts   axios instance pinned to the JSONPlaceholder base URL
    ├── components/            Loading, PostForm, UserCard (the latter two with tests)
    ├── context/
    │   ├── favorites-context.ts    Context object + useFavorites hook
    │   └── FavoritesContext.tsx    FavoritesProvider (+ its tests)
    ├── pages/                 Home, UserDetail (+ Home's tests)
    ├── test/setup.ts          jest-dom matchers and a deterministic localStorage
    └── types/index.ts         User and Post interfaces
```

The context is deliberately split across two files: React Fast Refresh (enforced here by
`eslint-plugin-react-refresh`) only works when a module exports components alone, so the provider
component lives apart from the context object and the `useFavorites` hook.

---

## Tests

Vitest runs in a jsdom environment with Testing Library. The suite covers behaviour rather than
implementation details:

- **`src/context/FavoritesContext.test.tsx`** — toggling on and off, persistence to `localStorage`,
  hydration on mount, graceful fallback when the stored value is not valid JSON and when it is valid
  JSON of the wrong shape, and the guard that makes `useFavorites` throw outside a provider.
- **`src/components/PostForm.test.tsx`** — a successful submit passes the title and body through and
  clears the form; a whitespace-only field is rejected; controls are disabled while the promise is
  pending; a rejected submit re-enables the form and preserves the draft (the component in isolation
  — see the caveat above).
- **`src/components/UserCard.test.tsx`** — rendered author fields, the `/user/:id` link target, and
  that starring an author reaches the persisted favourites store.
- **`src/pages/Home.test.tsx`** — the axios instance is mocked; covers the `/users` request, filtering
  by author name and by company name, the no-results state, and the error state with its retry button.

`src/test/setup.ts` installs an in-memory `Storage` implementation. This is deliberate: jsdom provides
its own `localStorage`, but Node >= 25 also defines a global `localStorage` that is inert unless the
process is started with `--localstorage-file`, and that stub otherwise wins inside the test
environment. Supplying one implementation keeps the suite identical on every Node version.

Run them with:

```bash
npm test
```

---

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request against `main`. It installs with
`npm ci` and runs `npm run lint`, `npm test` and `npm run build` on ubuntu-latest against Node 22 and
Node 24.

---

## Known limitations

- Created posts are not persisted, because the upstream demo API does not persist them (see above).
- Favourites are stored but not yet used for filtering or a dedicated view.
- Search filters only the page of authors already in memory; JSONPlaceholder returns all ten users in
  one request, so there is no pagination to worry about — but the approach would not scale to a real
  dataset.
- The API base URL is hard-coded rather than read from an environment variable.
- User-facing copy is Turkish only.

---

## License

This repository does not carry a licence yet. Until one is added, default copyright applies and no
permission to use, copy, modify or distribute the code is granted.
