# SP Properties website

Next.js 15, React 19, TypeScript and Tailwind CSS. The design uses the existing Bodoni Moda/Jost fonts, warm ivory, brand blue and yellow. Property prices are not shown in the UI.

## Local development

Use Node.js 22 or newer. From this folder:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Only copy the environment example on first setup; keep existing environment values when updating. Open http://localhost:3000. Saved source changes update this local preview automatically.

Development output goes to `.next-dev`. `npm run build` creates the finished static website in `dist`; `.next` is only an intermediate build cache. A production build can run without overwriting development chunks. Restart an already-running development server after dependency or configuration changes.

Development uses Turbopack for faster compilation. Next.js still compiles a route on its first development visit and disables route prefetching in development. To check actual browsing speed, stop the dev server and run `npm run preview`. This builds and serves the production site at http://localhost:3000; source changes require a new build in this mode.

Production navigation preloads the main menu after the initial page loads, including links hidden inside the mobile menu. Background preloading is skipped on data-saving and 2G connections. Netlify Image CDN delivers responsive WebP photos on the deployed site; the local static preview serves their original files. The Testimonials page loads its five client photos eagerly and opens without a welcome animation or scroll-reveal delays. Other pages have a brief welcome once per tab session, with immediate dismissal on browsing input. Mobile headings use the existing Jost font for readability. The About page includes the company story and Managing Directors Saravanan and Shanmugam.

### Deploy the `dist` folder to Netlify

```powershell
npm run build
```

This creates `dist/index.html`, HTML and navigation data for all 18 public pages, fonts, images, JavaScript, CSS, sitemap, robots file, and Netlify routing rules. Upload the **entire `dist` folder** at [Netlify Drop](https://app.netlify.com/drop). Folder uploads do not run a build, so run the command again before uploading later changes.

For deployment from a Git repository, `netlify.toml` sets:

- Build command: `npm run build`
- Publish directory: `dist`
- Node.js: `22`

Set the `NEXT_PUBLIC_*` values described below before building: use `.env.local` for a folder upload, or Netlify's environment settings for a repository build. The source images are included in `dist`; `lib/netlify-image-loader.ts` sends responsive requests to [Netlify Image CDN](https://docs.netlify.com/build/image-cdn/overview/), which supports local image paths without additional configuration.

Run `npm start` to check the finished export at `http://127.0.0.1:3000`. This preview serves the original image files locally; Netlify applies resizing and WebP conversion after deployment. Use Netlify Dev if you need to test the CDN transformations locally.

The project uses [Next.js static export](https://nextjs.org/docs/15/app/guides/static-exports). Enquiry forms, WhatsApp links, browser chat, galleries and client-side navigation remain available; adding future request-time server features will require revisiting the deployment setup.

### Share the live development preview

Run **one** `npm run dev` terminal for this project. It listens on port **3000** on all network interfaces. A second start on that address fails visibly instead of silently changing the port; stop the previous server with Ctrl+C before restarting. Running two development processes against `.next-dev` can overwrite each other's generated files.

In VS Code, open **Ports**, forward **3000**, and copy its **Forwarded Address**. Share the HTTPS `devtunnels.ms` address, not `localhost:3000`. For visitors who are not signed into your account, the port must have **Public** visibility. First-time browser visitors see Microsoft's tunnel confirmation page and must choose **Continue** themselves. Keep VS Code, the development terminal and the computer running while sharing. Saved source edits then refresh through the tunnel; this is a temporary preview, separate from production deployment.

## Checks and production preview

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint, including React and Next.js checks; warnings fail |
| `npm run typecheck` | TypeScript validation |
| `npm test` | Chat storage, matching, form validation and scroll regression tests |
| `npm run build` | Generate the upload-ready `dist` folder |
| `npm run validate` | Lint, types, regression tests and production build |
| `npm run test:e2e` | Browser tests against a production server on port 3015 |
| `npm start` | Preview the exported `dist` folder on port 3000 |
| `npm audit` | Check dependencies against current security advisories |

Run `npm run validate`, then `npm run test:e2e` before publishing. Browser tests use installed Microsoft Edge on Windows. On other platforms run `npx playwright install chromium` once. They do not send enquiries: WhatsApp opening is intercepted in form tests.

The PostCSS and minimatch overrides in `package.json` patch transitive dependencies. Keep them until the upstream dependencies include the security fixes; validate the app before changing them.

## Online updates

**This folder is not connected to a hosting project or a Git remote yet. Saving a local file does not publish it online.**

`.github/workflows/validate.yml` is ready to run checks on pushes and pull requests once the project is in GitHub. It runs the production build and browser tests. This workflow validates code; it does not publish a website.

To connect automatic deployment, connect the Netlify project to its repository and production branch, configure its environment variables, and use the settings in `netlify.toml`. After that, pushing a committed change to the production branch can trigger an online deployment. Other branches should use preview deployments.

For an existing VPS or manually uploaded host, deployment needs its own build/upload/restart configuration. Do not upload `node_modules`, `.next-dev`, test output or local environment files as source code.

## Pages and editable files

- `/`: hero, about, property collections, customer stories, scrolling locations and interiors, contact form.
- `/about`, `/projects`, `/services`, `/testimonials`, `/contact`, `/ambattur`.
- `/projects/[location]`: individual pages for the 11 locations.
- `/sitemap.xml`, `/robots.txt`: generated metadata.

| Folder/file | Content |
| --- | --- |
| `content/site.ts` | Business contact details, navigation and site URL |
| `content/about.ts` | About services, company principles and Managing Director profiles |
| `content/projects.ts` | Location data, home configurations and photos |
| `content/testimonials.ts` | Client names and supplied photographs |
| `content/services.ts` | The four services and their descriptions |
| `content/chatbot.ts` | Chat answers and quick replies |
| `components/landing/` | Homepage sections and scroll animations |
| `components/sections/HomeHero.tsx` | Existing homepage hero |
| `components/layout/` | Header, footer, services menu and floating actions |
| `components/testimonials/` | Full customer story page |
| `app/globals.css`, `components/landing/landing.css` | Responsive layouts and theme styles |
| `public/` | Public images and brand files |
| `tests/` | Automated regression and browser checks |

Use actual client names/photos in the testimonials data. Do not invent quotations or ratings. Confirm any remaining project names, statuses, office hours, credentials and map coordinates with the business before publishing them. Architectural concept and stock images should remain identified as such.

The About leadership panel displays both Managing Directors from the `aboutLeadership` array in `content/about.ts`. Each profile accepts an optional portrait with a local public `src`, descriptive `alt` and optional `objectPosition` for cropping. Until a photo is supplied, the name card appears without a portrait. The copy describes the company's approach and is not presented as a personal quotation.

## Enquiries and environment variables

Forms validate input and prepare a WhatsApp message. The visitor must press **Send in WhatsApp**; a completed website form alone does not send a message or confirm a visit. The page retains a fallback link if the browser blocks the popup.

Configure public values in `.env.local` for local development and in the hosting dashboard for deployment:

- `NEXT_PUBLIC_SITE_URL`: real public origin for canonical links, sitemap and schema.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: enquiry number, digits including country code.
- `NEXT_PUBLIC_GSC_VERIFICATION`: optional Search Console token.
- `NEXT_PUBLIC_GA_ID`: optional Analytics measurement ID.
- `NEXT_PUBLIC_ENQUIRY_WEBHOOK`: optional public enquiry endpoint; never put a secret URL or credential here. The endpoint must support browser CORS and validate submissions.

All `NEXT_PUBLIC_*` values are visible in the browser and are embedded when building. Changing a hosted value requires a fresh build/deployment.

## Production domain

The production address is `https://spproperties.co.in`. Canonical links, sitemap and schema use this address by default. `public/_redirects` supplies Netlify's permanent redirect from `www.spproperties.co.in` to `spproperties.co.in`, preserving the page path, and the page rewrites needed for direct visits. `public/_headers` supplies the social image content type and caching for hashed assets. Both files are copied into `dist` during the build.

The domain will be purchased through Hostinger. Website hosting still needs to be connected. Once a hosting project is available, add both `spproperties.co.in` and `www.spproperties.co.in` to it, then enter the DNS records supplied by that host in the domain's DNS settings. Configure `NEXT_PUBLIC_SITE_URL=https://spproperties.co.in` in the hosting environment and deploy. Both domain names need HTTPS enabled through the hosting provider.
