# GeoGebra Studio 0.4.0-rc.2

Date: 2026-10-13 (Asia/Shanghai). Status: public npm candidate, not stable 0.4.0.

Install the complete skills + MCP plugin:

```sh
npx @lydt/geogebra-studio@0.4.0-rc.2 install
```

Public package: https://www.npmjs.com/package/@lydt/geogebra-studio/v/0.4.0-rc.2

## Corrections from rc.1

- A neutral npm prefix prevents an unpacked plugin without node_modules from shadowing its npm runtime. rc.1 could register skills but failed MCP startup.
- File tools accept an explicit absolute `workspace`, with MCP roots as an alternative. Plugin mode rejects missing-workspace writes rather than saving into the plugin cache. Context remains isolated to one request.
- Packaged construction/export skills explain workspace selection. Package checks now launch an unpacked plugin with no dependencies and verify output paths.

## Actual validation

- TypeScript build, 200 unit tests, 55-tool protocol check and manifest checks passed.
- Clean tarball install and unpacked-plugin startup passed without lifecycle scripts or an external Gikz repository.
- Anonymous Registry metadata matched the accepted tarball integrity. A fresh npm cache and isolated CODEX_HOME installed the unmodified public package through the normal install command.
- A real Codex app-server session loaded all three plugin skills, confirmed server version 0.4.0-rc.2, called Gikz and generated checked packed-GGB HTML plus a preview in the user project.
- The public artifact passed four viewport checks, moving-A tangent/branch checks, LaTeX-label checks, native sidebar editing, themes, all seven downloads, packed-GGB/HTML reopen, and equality between browser and shared Gikz output.
- The cleaned TikZ downloaded from the public artifact compiled successfully to PDF with latexmk.

Evidence is retained under output/verification: registry-publication.json,
registry-rc2-session.json, registry-studio/, registry-rc2-viewer/ and registry-rc2-compile/.

## Remaining release work

- next points to rc.2; the initial latest tag still points to rc.1. Removing it requires a separate npm browser authorization. Use the pinned command above.
- Browser evidence is macOS with existing Chrome. Managed Chromium and Linux/Windows checks remain outstanding.
- Stable 0.4.0 is not published. Local source/workflow changes have not been pushed, and the updated release workflow has not run on GitHub.
- Installation tests used isolated Codex homes. Run the command above to install into the user's normal Codex home, then start a new session.
