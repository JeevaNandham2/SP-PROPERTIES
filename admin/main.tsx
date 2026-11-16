import { useEffect, useRef, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { acceptInvite, getUser, handleAuthCallback, login, logout, requestPasswordRecovery, updateUser } from "@netlify/identity";
import { MANAGED_IMAGE, MAX_UPLOAD_BYTES, projectSlug } from "../lib/cms/constants";
import type { CmsProject, CmsState } from "../lib/cms/model";
import "./style.css";

type EditorState = CmsState & { email: string; canPublish: boolean };
type AuthMode = "login" | "recovery" | "invite" | "password";
type Notice = { tone: "error" | "success" | "info"; text: string } | null;
const endpoint = "/.netlify/functions/project-admin";
const imageUrl = (src: string) => {
  const key = MANAGED_IMAGE.exec(src)?.[1];
  return key ? `${endpoint}?action=image&key=${key}` : src;
};
class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
async function api<T>(action = "state", init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${endpoint}?action=${action}`, { ...init, credentials: "same-origin", cache: "no-store" });
  if (!response.headers.get("content-type")?.includes("application/json")) throw new ApiError(response.status, "The editor backend is not connected on this copy of the website. Deploy the Netlify functions and complete admin setup first.");
  const data = await response.json();
  if (!response.ok) throw new ApiError(response.status, data.error || "The request could not be completed.");
  return data as T;
}
const jsonBody = (data: unknown): RequestInit => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";

function Brand() { return <a className="brand" href="/" aria-label="SP Properties website"><span className="brand-mark">SP</span><span>SP PROPERTIES<small>PROJECT EDITOR</small></span></a>; }

function App() {
  const [state, setState] = useState<EditorState | null>(null);
  const [projects, setProjects] = useState<CmsProject[]>([]);
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("Loading editor");
  const [notice, setNotice] = useState<Notice>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [inviteToken, setInviteToken] = useState("");
  const [liveRevision, setLiveRevision] = useState<string | null>(null);
  const [pendingRevision, setPendingRevision] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const didInitialize = useRef(false);
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const selectedProject = projects[selected];
  const locked = !!state?.published.projects.some(project => project.slug === selectedProject?.slug);

  function adopt(value: EditorState) {
    setState(value); setProjects(value.draft.projects); setDirty(false);
    setSelected(index => Math.min(index, value.draft.projects.length - 1));
    if (value.lastPublish?.status === "queued" && value.lastPublish.revision !== liveRevision) setPendingRevision(value.lastPublish.revision);
  }
  async function load() { const value = await api<EditorState>(); adopt(value); }
  useEffect(() => {
    if (didInitialize.current) return;
    didInitialize.current = true;
    void (async () => {
      try {
        const callback = await handleAuthCallback();
        if (callback?.type === "invite" && callback.token) { setInviteToken(callback.token); setMode("invite"); return; }
        if (callback?.type === "recovery") { setMode("password"); return; }
        await getUser(); // Restore automatic session refresh after reopening the editor.
        await load();
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) setNotice({ tone: "error", text: errorText(error) });
      } finally { setBusy(""); }
    })();
    // This bootstrap handles one-time invitation tokens exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (!state) return;
    let stopped = false;
    const checkLive = async () => {
      try {
        const response = await fetch(`/content-version.json?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        if (!stopped && typeof result.revision === "string") {
          setLiveRevision(result.revision);
          if (pendingRevision && result.revision === pendingRevision) {
            setPendingRevision(null);
            setNotice({ tone: "success", text: "Published. The updated project pages and images are now live." });
          }
        }
      } catch { /* Keep the last confirmed live version during transient network errors. */ }
    };
    void checkLive();
    const timer = window.setInterval(checkLive, pendingRevision ? 10_000 : 60_000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [state, pendingRevision]);

  async function signIn(event: FormEvent) {
    event.preventDefault(); setNotice(null); setBusy("Signing in");
    try {
      if (mode === "recovery") {
        await requestPasswordRecovery(email);
        setNotice({ tone: "success", text: "If this address has an admin account, a password reset link will arrive by email." });
        return;
      }
      if (mode === "invite" || mode === "password") {
        if (password !== confirmPassword) throw new Error("The passwords do not match.");
        if (mode === "invite") await acceptInvite(inviteToken, password);
        else await updateUser({ password });
        setInviteToken(""); setConfirmPassword(""); setMode("login");
      } else await login(email, password);
      setPassword("");
      await load();
    } catch (error) { setPassword(""); setNotice({ tone: "error", text: errorText(error) }); }
    finally { setBusy(""); }
  }
  async function signOut() {
    if (dirty && !window.confirm("Leave without saving your latest changes?")) return;
    setBusy("Signing out");
    try { await logout(); }
    finally { setState(null); setProjects([]); setDirty(false); setNotice(null); setBusy(""); setPassword(""); }
  }
  function edit(patch: Partial<CmsProject>) {
    setProjects(items => items.map((project, index) => index === selected ? { ...project, ...patch } : project));
    setDirty(true); setNotice(null);
  }
  function editImage(index: number, patch: Partial<CmsProject["gallery"][number]>) {
    const gallery = selectedProject.gallery.map((image, number) => number === index ? { ...image, ...patch } : image);
    edit({ gallery, image: gallery[0].src });
  }
  async function upload(file: File | undefined, index?: number) {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) { setNotice({ tone: "error", text: "Choose an image smaller than 3 MB." }); return; }
    setBusy("Optimizing and uploading image"); setNotice(null);
    try {
      const result = await api<{ src: string; bytes: number }>("upload", { method: "POST", body: file, headers: { "Content-Type": file.type } });
      const gallery = [...selectedProject.gallery];
      if (index === undefined) gallery.push({ src: result.src, alt: `Project exterior in ${selectedProject.location || "the selected location"}`, caption: "Project exterior", kind: "concept" });
      else gallery[index] = { ...gallery[index], src: result.src };
      edit({ gallery, image: gallery[0].src });
      setNotice({ tone: "success", text: `Image uploaded and optimized (${Math.round(result.bytes / 1024)} KB). Save your draft to keep this change.` });
    } catch (error) { setNotice({ tone: "error", text: errorText(error) }); }
    finally { setBusy(""); }
  }
  async function save() {
    if (!state) throw new Error("Sign in again before saving.");
    const value = await api<EditorState>("state", { method: "PUT", ...jsonBody({ baseRevision: state.draft.revision, projects }) });
    adopt(value);
    return value;
  }
  async function saveDraft() {
    setBusy("Saving draft"); setNotice(null);
    try { await save(); setNotice({ tone: "success", text: "Draft saved. Publish when you are ready to update the live website." }); }
    catch (error) { setNotice({ tone: "error", text: errorText(error) }); }
    finally { setBusy(""); }
  }
  async function publish() {
    setBusy("Preparing publication"); setNotice(null);
    try {
      const saved = dirty ? await save() : state!;
      const result = await api<{ revision: string }>("publish", { method: "POST", ...jsonBody({ revision: saved.draft.revision }) });
      setPendingRevision(result.revision);
      setState(current => current ? { ...current, published: saved.draft, lastPublish: { revision: result.revision, requestedAt: new Date().toISOString(), status: "queued" } } : current);
      setNotice({ tone: "info", text: "Publish requested. Netlify is rebuilding the pages; this screen will confirm when the new version is live. You can keep editing another draft." });
    } catch (error) { setNotice({ tone: "error", text: errorText(error) }); }
    finally { setBusy(""); }
  }
  function addProject() {
    const number = projects.length + 1;
    const project: CmsProject = { slug: `flats-in-new-project-${number}`, location: "", name: "", description: "", configurations: [{ bhk: 2 }, { bhk: 3 }], image: "", gallery: [], nearby: [], featured: false };
    setProjects([...projects, project]); setSelected(projects.length); setQuery(""); setDirty(true); setNotice(null);
    requestAnimationFrame(() => editorHeading.current?.focus());
  }
  async function reloadDraft() {
    if (dirty && !window.confirm("Discard your unsaved changes and load the latest saved draft?")) return;
    setBusy("Loading latest draft");
    try { await load(); setNotice({ tone: "info", text: "Latest saved draft loaded." }); }
    catch (error) { setNotice({ tone: "error", text: errorText(error) }); }
    finally { setBusy(""); }
  }

  const alert = notice && <div className={`notice ${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.text}</div>;
  if (!state) return <div className="login-page">
    <header><Brand /><a href="/">Visit website ↗</a></header>
    <main className="login-card">
      <p className="eyebrow">PRIVATE ACCESS</p>
      <h1>{mode === "recovery" ? "Reset your password" : mode === "invite" ? "Welcome to your editor" : mode === "password" ? "Choose a new password" : "Manage your projects"}</h1>
      <p>{mode === "login" ? "Sign in to update images, edit project details and publish new cards." : mode === "recovery" ? "Enter the email address used for your admin account." : "Set a password of at least 12 characters for your private admin account."}</p>
      {alert}
      <form onSubmit={signIn}>
        <fieldset disabled={!!busy}>
          {(mode === "login" || mode === "recovery") && <label>Email address<input name="email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>}
          {mode !== "recovery" && <label>Password<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "login" ? undefined : 12} required value={password} onChange={event => setPassword(event.target.value)} /></label>}
          {(mode === "invite" || mode === "password") && <label>Confirm password<input type="password" autoComplete="new-password" required minLength={12} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></label>}
          <button className="primary wide" type="submit">{busy || (mode === "login" ? "Sign in" : mode === "recovery" ? "Send reset link" : "Save password and continue")}</button>
        </fieldset>
      </form>
      {(mode === "login" || mode === "recovery") && <button className="text-button" disabled={!!busy} onClick={() => { setMode(mode === "login" ? "recovery" : "login"); setNotice(null); }}>{mode === "login" ? "Forgot your password?" : "Back to sign in"}</button>}
      <small className="private-note">Access is limited to the invited project administrator.</small>
    </main>
  </div>;

  const live = state.draft.revision === liveRevision && !dirty;
  return <div className="editor-app">
    <header className="topbar"><Brand /><div className="account"><span>{state.email}</span><a href="/projects" target="_blank" rel="noopener noreferrer">View website ↗</a><button onClick={signOut} disabled={!!busy}>Sign out</button></div></header>
    <div className="workspace">
      <aside className="sidebar" aria-label="Project list">
        <div className="sidebar-title"><h2>Projects</h2><span>{projects.length}</span></div>
        <button className="primary wide" disabled={!!busy || projects.length >= 100} onClick={addProject}>＋ Add project</button>
        <label className="search-label"><span className="sr-only">Search projects</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search projects…" /></label>
        <nav className="project-list" aria-label="Choose project">{projects.map((project, index) => (!query || `${project.location} ${project.name}`.toLowerCase().includes(query.toLowerCase())) && <button key={index} className={selected === index ? "project-option active" : "project-option"} aria-current={selected === index ? "true" : undefined} disabled={!!busy} onClick={() => setSelected(index)}>
          {project.image ? <img src={imageUrl(project.image)} alt="" loading="lazy" /> : <span className="thumb-placeholder">＋</span>}
          <span><strong>{project.name || project.location || "New project"}</strong><small>{project.location || "Add location and image"}</small></span>
        </button>)}</nav>
        <p className="sidebar-tip">Changes are saved privately until you publish them.</p>
      </aside>
      <main className="editor-main">
        <div className="editor-toolbar"><div><p className="eyebrow">YOUR WEBSITE, UP TO DATE</p><h1 ref={editorHeading} tabIndex={-1}>{selectedProject?.name || selectedProject?.location || "New project"}</h1><span className={`save-status ${live ? "is-live" : ""}`}>{busy || (dirty ? "Unsaved changes" : pendingRevision ? "Publishing…" : live ? "Live website is up to date" : "Saved draft")}</span></div>
          <div className="save-actions"><button disabled={!!busy} onClick={reloadDraft}>Reload draft</button><button disabled={!!busy || !dirty} onClick={saveDraft}>Save draft</button><button className="primary" disabled={!!busy || !state.canPublish || !!pendingRevision} onClick={publish}>Publish changes</button></div>
        </div>
        {alert}
        {!state.canPublish && <div className="notice info">Publishing is not activated yet. Your Netlify administrator needs to connect the build hook before changes can go live.</div>}
        {pendingRevision && <div className="publish-progress" role="status">Waiting for the new website build. If it does not finish, check the deploy in Netlify. <button className="text-button" disabled={!!busy} onClick={() => { setPendingRevision(null); setNotice({ tone: "info", text: "The previous build may still be running. You can now retry publishing if it failed in Netlify." }); }}>Build failed? Enable retry</button></div>}
        {selectedProject && <div className="edit-layout">
          <fieldset className="editor-fields" disabled={!!busy}>
            <section className="panel"><div className="panel-heading"><span className="step">01</span><div><h2>Project details</h2><p>Update the information shown on your cards and project page.</p></div></div>
              <div className="field-grid"><label>Location<input required maxLength={70} readOnly={locked} value={selectedProject.location} onChange={event => { const location = event.target.value; edit({ location, slug: projectSlug(location) }); }} /></label><label>Project / card title <span className="optional">optional</span><input maxLength={100} value={selectedProject.name || ""} placeholder={selectedProject.location || "e.g. SP Residency"} onChange={event => edit({ name: event.target.value })} /></label></div>
              <label>Page address<input value={`/projects/${selectedProject.slug}`} readOnly={locked} onChange={event => edit({ slug: event.target.value.replace(/^\/projects\//, "") })} /><small>{locked ? "This published address is locked to preserve existing links and search listings." : "Choose a unique address before publishing. It will be locked once published."}</small></label>
              <label>Project description<textarea rows={4} maxLength={1200} value={selectedProject.description || ""} onChange={event => edit({ description: event.target.value })} placeholder="Describe the project, its highlights and the local area." /><small>{(selectedProject.description || "").length} / 1200 characters</small></label>
              <div className="field-grid"><fieldset className="flat-types"><legend>Flat types</legend>{([2, 3] as const).map(bhk => <label key={bhk} className="choice"><input type="checkbox" checked={selectedProject.configurations.some(config => config.bhk === bhk)} onChange={event => edit({ configurations: event.target.checked ? [...selectedProject.configurations, { bhk }].sort((a, b) => a.bhk - b.bhk) : selectedProject.configurations.filter(config => config.bhk !== bhk) })} />{bhk} BHK</label>)}</fieldset><label>Status <span className="optional">optional</span><input maxLength={80} value={selectedProject.status || ""} placeholder="e.g. Ready to move" onChange={event => edit({ status: event.target.value })} /></label></div>
              <label className="choice"><input type="checkbox" checked={!!selectedProject.featured} onChange={event => edit({ featured: event.target.checked })} />Mark as a featured project</label>
            </section>
            <section className="panel"><div className="panel-heading"><span className="step">02</span><div><h2>Project images</h2><p>The first image appears on the card. Full images fit on every screen.</p></div></div>
              {selectedProject.gallery.map((image, index) => <div className="image-editor" key={`${selectedProject.slug}-${index}`}>
                <div className="image-heading"><h3>{index === 0 ? "Card image" : `Gallery image ${index + 1}`}</h3><div>{index > 0 && <button onClick={() => { const gallery = [image, ...selectedProject.gallery.filter((_, number) => number !== index)]; edit({ gallery, image: gallery[0].src }); }}>Use on card</button>}{selectedProject.gallery.length > 1 && <button onClick={() => { const gallery = selectedProject.gallery.filter((_, number) => number !== index); edit({ gallery, image: gallery[0].src }); }}>Remove</button>}</div></div>
                <div className="image-fields"><div><img className="upload-preview" src={imageUrl(image.src)} alt={image.alt} /><label className="file-label">Replace image<input aria-label={`Replace image ${index + 1}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void upload(event.target.files?.[0], index); event.target.value = ""; }} /></label></div><div><label>Image description (alt text)<input maxLength={250} value={image.alt} onChange={event => editImage(index, { alt: event.target.value })} /></label><label>Caption<input maxLength={120} value={image.caption} onChange={event => editImage(index, { caption: event.target.value })} /></label><label>Image type<select value={image.kind} onChange={event => editImage(index, { kind: event.target.value as typeof image.kind })}><option value="photograph">Project photograph</option><option value="rendering">Architectural rendering</option><option value="concept">Design concept</option><option value="inspiration">Interior inspiration</option><option value="enquiry">Enquiry image</option></select></label></div></div>
              </div>)}
              {selectedProject.gallery.length < 8 && <label className="add-image">＋ {selectedProject.gallery.length ? "Add gallery image" : "Upload card image"}<input aria-label="Add project image" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} /><small>JPG, PNG or WebP · up to 3 MB · optimized automatically</small></label>}
            </section>
            <section className="panel"><div className="panel-heading"><span className="step">03</span><div><h2>Nearby projects</h2><p>Choose up to three related project pages.</p></div></div><div className="nearby-options">{projects.filter(project => project.slug !== selectedProject.slug && project.location).map(project => <label className="choice" key={project.slug}><input type="checkbox" checked={selectedProject.nearby.includes(project.slug)} disabled={!selectedProject.nearby.includes(project.slug) && selectedProject.nearby.length >= 3} onChange={event => edit({ nearby: event.target.checked ? [...selectedProject.nearby, project.slug] : selectedProject.nearby.filter(slug => slug !== project.slug) })} />{project.name || project.location}</label>)}</div></section>
          </fieldset>
          <aside className="preview-column" aria-label="Live card preview"><div className="preview-sticky"><p className="eyebrow">CARD PREVIEW</p><article className="card-preview">{selectedProject.image ? <img src={imageUrl(selectedProject.image)} alt={selectedProject.gallery[0]?.alt || "Project preview"} /> : <div className="empty-preview">Upload your project image</div>}<div className="preview-copy"><span className="eyebrow">SP PROPERTIES</span><h2>{selectedProject.name || selectedProject.location || "Your project title"}</h2><p>{selectedProject.configurations.map(config => `${config.bhk} BHK`).join(" & ")} flats</p>{selectedProject.status && <span className="status-badge">{selectedProject.status}</span>}<p className="preview-description">{selectedProject.description || "Ask for prices and floor plans."}</p><span className="preview-link">View details ↗</span></div></article><div className="preview-note"><strong>Ready for search.</strong><p>Public pages keep their own addresses, page titles and sitemap entries. Publishing updates the static pages and refreshes image filenames.</p></div></div></aside>
        </div>}
        <footer className="editor-footer">SP Properties · Private project management</footer>
      </main>
    </div>
  </div>;
}

createRoot(document.getElementById("root")!).render(<App />);
