# Validation status — GeoGebra Studio 0.4.0 source candidate

## Passed locally

- TypeScript build and generated canonical/compatibility plugin manifests.
- Jest unit suite: 15 suites, 200 tests, including explicit workspace isolation and MCP roots.
- Official MCP SDK stdio handshake: 55 tools, including `geogebra_build_artifact`.
- Clean npm package install with lifecycle scripts disabled, no external Gikz checkout, built-in TikZ cleanup, and MCP server startup.
- The `rc.2` tarball passed an unpacked-plugin launcher test with no plugin node_modules; its npx prefix selected the actual runtime, workspace output succeeded, and missing-workspace writes were rejected.
- A fresh local-source `rc.2` Codex session loaded three skills and generated the verified tangent HTML and preview in the user project, with the returned path checked against that project.
- Native headless GeoGebra: actual packed GGB ZIP, final HTML reopen, 16 construction objects, and rejection of an invalid command without a success artifact.
- Real Chrome viewer checks at four viewport sizes; equal axes and circle dimensions, 24 moving-A tangent/branch samples, LaTeX-label XML flags, editable original object sidebar, all seven downloads, saved HTML reopen, and native-edited PGF equality with shared Gikz output.
- Gikz output is built into the HTML with its license notice; no `new Function` loading path or `GIKZ_CLI` dependency remains.
- Every MCP TikZ route passed native PGF → built-in Gikz checks; the standalone cleaned result compiled to PDF with `latexmk`.
- npm tarball and versioned plugin ZIP were built as local candidate artifacts.
- Both the local-source path and the unmodified public `rc.2` npm plugin loaded all three skills, discovered the MCP server, called Gikz, and produced a verified native artifact in the user project through real fresh Codex app-server sessions.
- Public `rc.2` was anonymously installed using a fresh npm cache and CODEX_HOME with lifecycle scripts disabled. Registry tarball integrity matched the accepted artifact. Its generated HTML passed responsive geometry, native editing, seven-download and shared-Gikz checks.

## Release blockers

- On 2026-10-13, `0.4.0-rc.1` was published and verified anonymously against the local tarball integrity. Public npx installation passed, but the installed MCP failed because npx mistook the unpacked package for a locally installed executable. A prefix probe fixed startup and revealed that output paths defaulted to the plugin cache.
- `rc.2` is published and passed public marketplace acceptance. It fixes startup with a packaged neutral npm prefix, scopes output to an explicit workspace or MCP roots, and refuses silent writes into the plugin cache. The `next` tag points to `rc.2`; the automatic initial `latest` tag still points to `rc.1` pending separate npm authorization to remove it.
- The accepted browser and Codex session checks ran on macOS with installed Google Chrome. The pinned managed-Chromium installation and Linux/macOS/Windows clean setups still need release CI before making cross-platform claims.
- The source/workflow changes are local and have not been pushed. The workflow now publishes the exact acceptance tarball, tolerates the Registry scan delay, then runs public plugin acceptance; this updated GitHub workflow has not yet executed.

## Candidate artifacts

`release/` contains npm tarballs, versioned plugin ZIPs, and the current package inventory. `output/verification/` contains native MCP, browser, Registry-integrity and screenshot evidence. Build outputs are ignored by Git; only versions separately acknowledged and publicly readable on npm count as published.
