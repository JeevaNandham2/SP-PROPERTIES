# SP Properties project editor

The standalone React editor is at `/admin/`. The single intended login is
`sppropertiessp@gmail.com`. Its password is chosen privately through a Netlify
Identity invitation; there is no password in the website source or JavaScript.

## What is implemented

- Edit project titles, descriptions, status, featured labels and 2/3 BHK choices.
- Replace card images, manage up to eight gallery images, and add project cards.
- Preview edits immediately, save durable drafts and publish deliberately.
- Resize uploads to at most 1600 × 2000 pixels and convert to WebP. Images are
  contained within their responsive frames. New content-hash filenames prevent
  old image caches from hiding an update.
- Keep existing published addresses and locations locked. The editor cannot
  delete an indexed page. New projects receive static detail pages, internal
  links, metadata and sitemap entries on the next build.
- Preserve public static hosting: the React editor and Identity SDK never load
  on visitor pages. Admin HTML/API responses are excluded from indexing.

## One-time production activation

**A manual upload of `dist` alone does not activate this editor.** It includes the
screen but cannot install the protected functions or run future publishing
builds. Use the source project with Netlify's Git build integration (or an
equivalent Netlify CLI build/deploy that includes functions).

1. Put the reviewed source, including all previous image corrections, on the
   production Git branch and connect the existing `sppropertiespreview` Netlify
   project to that branch. Keep the existing domain, canonical URL and site ID.
   The included `netlify.toml` sets `npm run build`, `dist`, the function folder,
   Node 22, the CMS content plugin and `CMS_ENABLED=true`.
2. Enable Netlify Identity. Set registration to **Invite only**. Keep email
   confirmation enabled; do not enable public signup or Git Gateway.
3. Invite only `sppropertiessp@gmail.com`, then give that Identity user the exact
   role **`project-admin`**. The server checks both this role and the email.
   The owner must open the invitation and choose their password. Default links
   arriving at the homepage are forwarded to `/admin/` without transmitting the
   token in a query string.
4. After the production branch has built once, create a Netlify build hook for
   that branch named `Publish project content`. Add its URL as the secret
   environment variable **`CMS_BUILD_HOOK`**, scoped to **Functions**, in the
   production context. Redeploy so the function receives the variable.
   Never put the hook URL into `NEXT_PUBLIC_*`, Git, an admin form or a ZIP.
5. `CMS_ADMIN_EMAIL` may override the login allowlist if explicitly needed; set
   it in Netlify's **Functions** scope. The server defaults to the SP Properties
   email above. A build-only variable in `netlify.toml` does not supply function
   environment variables.
6. Visit `/admin/`, sign in, make a small reviewed edit, save it, and publish.
   Confirm that the editor says the version is **live**, then check the public
   project page, image and sitemap. A queued build is not a confirmed publication.

No Netlify personal access token or GitHub token is required by the application.
Netlify supplies Blobs credentials to the functions and build plugin. Production
Identity access and publication must be verified on the connected Netlify site;
local tests use an isolated store and mocked authenticated browser responses.

## Publishing behaviour

Drafts and images live in the private site-wide Netlify Blobs store
`sp-properties-projects-v1`. Saves use strong consistency and conditional writes;
a stale editor tab cannot silently overwrite a newer save. Publishing records
an immutable snapshot, selects it for the next build and calls the private build
hook. The public website continues serving its current deploy while the new
static pages are built. The editor polls the uncached `content-version.json` and
only reports **live** when the matching revision is being served.

Edits preview immediately inside the editor. Public changes require a successful
Netlify build, so they are not instantaneous. A build or hook failure leaves the
existing deploy available and the saved draft intact. Google decides when to
recrawl and how to rank pages; preserving static HTML, URLs and metadata cannot
guarantee an unchanged ranking.

Existing titles and descriptions are kept by default. Changing flat types changes
the corresponding factual page title. Avoid misleading descriptions, inaccurate
image labels and unnecessary title changes. New locations without known map
coordinates appear in cards and navigation without inventing a map pin.

## Development and checks

```text
npm ci
npm run validate
npm run test:e2e
```

`npm run dev` and ordinary local builds use `content/projects.seed.json`.
`content/projects.data.json` is generated, not a second source to edit manually.
On Netlify the pre-build plugin downloads the published snapshot and its images
before the Next export. It fails the build if data or images are invalid instead
of silently replacing live content with seed content.

For live backend development, use Netlify Dev with the intended project linked
and Identity configured; do not add an authentication bypass. The ordinary
static preview intentionally does not emulate sign-in or accept writes.

The `revisions/` entries in the Blobs store are content backups. Keep a store
export before migrating or deleting a Netlify project; the data is associated
with the site ID, not with Git. Reverting a code deployment does not delete the
saved drafts. Restore content through a reviewed snapshot and a new build.
