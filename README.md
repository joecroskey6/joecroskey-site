# Joe Croskey website

Source and update workflow for [joecroskey.com](https://joecroskey.com).

- Repository: [joecroskey6/joecroskey-site](https://github.com/joecroskey6/joecroskey-site)
- Hosting: Vercel, project `joecroskey-site`
- Production branch: `main`
- Vercel project URL: [joecroskey-site.vercel.app](https://joecroskey-site.vercel.app)
- Local project: `/Users/joecroskey/Documents/ChatGPT/joe website`

## Updating with Codex

Open the **joe website** project and describe the change, supplying any new text, images, audio, or links. For example: “Add this project to my portfolio and show me a preview.” Codex can edit this repository, run the checks below, and show a local preview. When you want the change published, say “Publish these changes to joecroskey.com.”

The existing publishing route is GitHub → Vercel. Updates to `main` deploy to production. A local edit or local commit does not publish anything.

## Start a local preview

Use Node.js 22 (verified here with 22.15.0) and npm. On first setup, or after the lockfile changes:

```bash
cd "/Users/joecroskey/Documents/ChatGPT/joe website"
npm ci
```

Then start the server:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open [localhost:3000](http://localhost:3000). Stop the server with Ctrl+C. If that port is occupied, choose another port and use it in the URL.

Use this server for previews: the homepage embeds Next.js pages and API routes, so opening the HTML file directly will not fully work. No environment variables or API keys are required by the current source. Gallery data, media embeds, fonts, and some homepage styling require an internet connection.

## Where to make changes

| Content | Location |
| --- | --- |
| Personal homepage, About/CV, Projects, Music, Connect, homepage styles and scripts | `public/index.html` |
| Homepage title and social metadata | HTML head in `public/index.html` |
| 3D aquarium scene, fish, plants, water and lighting | `scene/aquarium.js` |
| Aquarium loading, pause control and entry cleanup | `scene/boot.js` |
| Project pictures and videos | `public/projects/` |
| Radio audio files | `public/audio/` |
| Radio playlist | Playlist array in `public/index.html` |
| Design gallery | `app/gallery/page.tsx`, `components/MasonryGrid.tsx`, `lib/vam.ts` |
| Cocktail and cigarette pages | `app/fun/` and `app/api/fun/` |
| Shared Next.js navigation and styling | `components/Navigation.tsx`, `app/globals.css` |

`app/page.tsx` redirects `/` to `/index.html`; the personal homepage content lives in `public/index.html`. Its main content templates are `tpl-about`, `tpl-projects`, `tpl-music`, and `tpl-connect`. Files under `public/` are served from `/`, so `public/projects/example.jpg` is referenced as `/projects/example.jpg`.

The entrance aquarium is rendered locally with Three.js. `npm run dev` and `npm run build` automatically bundle `scene/boot.js` into the ignored generated file `public/aquarium.js`. `vercel.json` explicitly uses `npm run build` so production also generates this asset. After editing scene JavaScript while the development server is already running, run `npm run build:aquarium` and refresh the browser. Keep changes in `scene/`, not the generated bundle. The HTML welcome and Enter button remain available when WebGL cannot run. Reduced-motion preferences render a still scene; the pause control stops motion; entering the site releases the aquarium renderer.

## Change, verify, publish

1. Check `git status` and preserve any unfinished local edits. With a clean working tree, update `main` using `git pull --ff-only`, then create a descriptive branch such as `codex/update-portfolio`.
2. Make the requested edits and review the local preview. Check changed sections at desktop and mobile sizes, including relevant links and media.
3. Run the checks below. TypeScript checks matter because the inherited Next.js configuration skips type validation during builds.

   ```bash
   npm run lint
   npx tsc --noEmit
   npm run build
   ```

4. Review `git diff` and commit only the intended files. For a hosted preview, push the working branch and open a pull request; follow the deployment link Vercel provides for that branch or PR.
5. To publish, merge the reviewed change into `main` and confirm the Vercel production deployment succeeds. Then check the changed content at [joecroskey.com](https://joecroskey.com).

To undo a published change, revert its commit through Git and deploy that revert, or restore a previous deployment in Vercel.

## Setup verification and inherited maintenance

Restored from `origin/main` commit `15710c6` on 1 October 2026. The restored `public/index.html` matched the live homepage byte for byte. GitHub authentication and the latest successful Vercel production deployment were verified. The repository's original npm package name is `medieval-music-gallery`; this is still the correct personal website repository.

The production build passes, the homepage renders in the local preview, and lint reports zero errors with six existing image warnings. The independent TypeScript check currently reports six inherited errors: duplicate object keys in `components/CocktailIllustration.tsx` and possible null access in `components/WiiCursor.tsx`. These should be resolved before treating all checks as passing. `next.config.ts` now explicitly uses this project as the Turbopack root so unrelated parent lockfiles do not affect local development.

Before the aquarium release on 1 October 2026, Next.js and its matching ESLint configuration were upgraded to 16.3.8 and compatible transitive fixes were applied. npm audit then reported zero vulnerabilities.

The site relies on V&A, TheCocktailDB, ciggies.app, and third-party media embeds. The contact form's existing Formspree endpoint has not been verified. A successful local build does not confirm those external services work.
