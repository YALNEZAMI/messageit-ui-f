# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Pour lancer le front, l'API et MongoDB ensemble avec Docker Compose, consultez
la section « Lancer avec Docker Compose » du README de `messageit-api-f`.

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

For local development, open [http://localhost:3000](http://localhost:3000)
in your browser. The development server listens on `0.0.0.0` so it can also
accept network connections, but that address is not the recommended browser
URL. The API's Socket.IO configuration permits the local origins
`localhost:3000`, `127.0.0.1:3000`, and `0.0.0.0:3000`. If you change the
frontend port or use another host, add that exact origin to the API's
`config/default.json` and restart the API.

### Assistant Gemini

Configure `GEMINI_KEY` in the API's `.env`, not in the frontend. The optional
`GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`; use a model available to
your Google AI Studio project that supports `generateContent` if necessary.
Restart the API after changing these values. Conversation text and images sent
to the assistant are transmitted to Gemini.

### MongoDB

Set `MONGODB_URI` in the API's `.env` file or deployment environment, for
example `MONGODB_URI=mongodb://localhost:27017/message-it-api` for a local
database. The API reads this value at startup; restart it after changes. Never
commit connection strings containing credentials.

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
