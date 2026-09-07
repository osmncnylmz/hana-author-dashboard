# Hana Author Dashboard

A small React 19 + TypeScript single-page app that browses authors and the posts they have written,
built as a frontend case study for Hana Travel.

Despite the "dashboard" in the name there is no backend, no authentication and no author management in
the CRUD sense. The app is a read-mostly client for the public
[JSONPlaceholder](https://jsonplaceholder.typicode.com) demo API: its `/users` are presented as
authors and its `/posts` as their articles. A UI and state-management exercise, not a CMS.

The app's strings are Turkish. Identifiers, file names, comments, this README and the commit history
are English, but every string literal is Turkish, from user-facing copy (`Yazar Kadromuz`,
`Profili İncele`, `Yayınla`) down to `console.error` messages and thrown error text. There is no i18n
layer.

## What it does

Two routes, wired with React Router.

`/` renders `Home`, which fetches `GET /users` on mount and lays out one `UserCard` per author in a
responsive grid. The search box filters the already-loaded list in the browser, matching a
case-insensitive substring against the author's name or their company name. A spinner covers the
request; if it fails you get an error panel whose "Tekrar Dene" button reloads the page; if the query
matches nothing you get a separate empty state that quotes back what you typed.

`/user/:id` renders `UserDetail`, which fires `GET /users/:id` and `GET /posts?userId=:id` together
through `Promise.all` and then shows the author's name, a company badge, the post count, a form for a
new post, and the posts. Its back button is `navigate(-1)`, so it returns wherever you came from
rather than always to `/`.

### Components

Starring an author is the only thing `UserCard` does beyond showing a name, email and company and
linking through to `/user/:id`. `Loading` is the spinner both pages sit behind while they wait.

`PostForm` is a controlled title/body form. It refuses to submit when either field is only whitespace,
disables its inputs and swaps the button for a "Yayınlanıyor…" spinner while the submit promise is in
flight, clears both fields once it resolves, and on rejection logs the error, re-enables itself and
keeps the draft. Nothing the app hands it ever rejects, so that last path is unreachable in practice;
see below.

### Favorites

Favorited author ids live in one array inside `FavoritesProvider`, hydrated from `localStorage` under
the key `hana_author_favorites_v1` on first render and written back on every change. Reads and writes
sit inside `try`/`catch`, and the hydrated value is checked with `Array.isArray` and then narrowed to
numeric ids, so a store holding invalid JSON, valid JSON of the wrong shape, an array someone
hand-edited, or no usable storage at all degrades to an empty list rather than taking the app down
with it. `useFavorites` throws if it is called outside the provider.

The star on `UserCard` is the only place favorites surface. Nothing filters the grid down to them and
there is no favorites page; the state is persisted and ready, and nothing else consumes it yet.

### Created posts do not survive a reload

`POST /posts` on JSONPlaceholder is faked. It validates the payload and echoes it back with a
hard-coded `id` of `101` but stores nothing, so the second post you create arrives wearing the same id
as the first, and React starts warning about duplicate keys the moment both are in the list.
`UserDetail` therefore overwrites the returned id with `Date.now()` before prepending the post. That
is enough to keep the keys apart for the rest of the session, which is all the lifetime the post has:
it shows up immediately and is gone on the next load. A property of the demo API rather than a bug in
the form.

The handler `UserDetail` hands to `PostForm` also swallows its own failure. It logs the error and
shows an `alert("Post eklenemedi.")`, but does not rethrow, so from the form's point of view the
submit always succeeds and a failed `POST` still clears the draft. The form's own
keep-the-draft-on-rejection behavior is real and covered by a test; nothing in the shipped app
triggers it. Fixing that properly means rethrowing from `handleAdd` and giving the form somewhere to
render the message, because right now that `alert` is the entire error UI on this route.

## Stack

React 19 on TypeScript 5.9, with `strict`, `noUnusedLocals` and `noUnusedParameters` turned on. Vite 7
builds and serves it. Routing is React Router 7 (`BrowserRouter`), HTTP goes through a single shared
axios instance, icons come from lucide-react. Styling is Tailwind CSS 4 through `@tailwindcss/postcss`
and nothing else: there is no `tailwind.config.js`, because Tailwind 4 does not want one, and
`src/index.css` is the import plus a `body` rule, so every class in the app is a stock utility written
inline in the JSX. Tests run on Vitest 3 and Testing Library in jsdom, and linting is ESLint 9 flat
config with typescript-eslint, react-hooks and react-refresh.

Server state is `useEffect` + `useState` in the two page components; no data-fetching library sits
behind them. Client state is one React context plus `localStorage`. There is no state-management
library, no service worker, no environment configuration: the API base URL is hard-coded in
`src/api/axiosInstance.ts` and there is no `.env` file to create.

## Running it

Node.js 22.12 or newer, and npm.

```bash
git clone https://github.com/osmncnylmz/hana-author-dashboard.git
cd hana-author-dashboard
npm install
npm run dev
```

Vite serves the app at <http://localhost:5173>. It talks to the public JSONPlaceholder API over the
network, so the first load needs an internet connection; there is no mock server and nothing to
configure.

| Script                  | What it runs |
| ----------------------- | ------------ |
| `npm run dev`           | Vite dev server with HMR on port 5173. |
| `npm run build`         | `tsc -b` across the project references, then `vite build` into `dist/`. Type errors fail the build. |
| `npm run preview`       | Serves the built `dist/` output. |
| `npm run lint`          | ESLint over the repository (`dist/` and `coverage/` are ignored). |
| `npm test`              | Vitest, single run. |
| `npm run test:watch`    | Vitest in watch mode. |
| `npm run test:coverage` | Vitest with V8 coverage (text + lcov). |

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
    ├── index.css              Tailwind import and a body rule
    ├── api/axiosInstance.ts   axios instance pinned to the JSONPlaceholder base URL
    ├── components/            Loading, PostForm, UserCard (the latter two with tests)
    ├── context/
    │   ├── favorites-context.ts    Context object + useFavorites hook
    │   └── FavoritesContext.tsx    FavoritesProvider (+ its tests)
    ├── pages/                 Home, UserDetail (+ Home's tests)
    ├── test/setup.ts          jest-dom matchers and a deterministic localStorage
    └── types/index.ts         User and Post interfaces
```

The context is split across two files on purpose: React Fast Refresh, enforced here by
`eslint-plugin-react-refresh`, only works when a module exports components alone, so the provider
lives apart from the context object and the hook.

## Tests

Vitest runs in a jsdom environment with Testing Library, against behavior rather than implementation
details.

`FavoritesContext.test.tsx` carries most of it: toggling ids on and off, persistence, hydration, the
guard that makes `useFavorites` throw outside a provider, and three separate bad values pushed into
the storage key — text that is not JSON, JSON that is not an array, and an array with `'two'` and
`null` sitting in it.

`PostForm.test.tsx` covers the happy submit, a whitespace-only field being rejected, the controls
going disabled while the promise is pending, and a rejection leaving the draft in place (the
component in isolation, per the caveat above). `UserCard.test.tsx` checks the rendered fields, the
link target, and that starring reaches storage. `Home.test.tsx` mocks the axios instance for the
`/users` request, both filters, the no-results state and the error panel with its retry button.

`src/test/setup.ts` installs its own in-memory `Storage` instead of trusting the ambient one. The
comment at the top of that file explains which Node version makes that necessary and why.

```bash
npm test
```

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request against `main`. It installs with
`npm ci`, then runs `npm run lint`, `npm test` and `npm run build` on ubuntu-latest against Node 22
and Node 24.

## Known limitations

- Created posts are not persisted, because the upstream demo API does not persist them.
- Favorites are stored but not yet used for filtering or a dedicated view.
- Search filters only the authors already in memory. JSONPlaceholder returns all ten users in one
  request so there is no pagination to worry about here, but the approach would not carry over to a
  real dataset.
- The API base URL is hard-coded rather than read from an environment variable.
- User-facing copy is Turkish only.

## License

No license file yet, so default copyright applies.
