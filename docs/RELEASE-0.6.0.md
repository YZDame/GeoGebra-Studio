# GeoGebra Studio v0.6.0

This release adds a bundled HTTP preview for agent-client browsers and fixes the canvas frame in dark mode while retaining the normal light-mode border.

## Changes

- Add `preview --input FILE.html --workspace ABS_DIR`. The dependency-free command serves one HTML snapshot on an ephemeral `127.0.0.1` port; it does not expose the workspace or add a backend. Keep the process running while the browser is open.
- Use an actual client browser pane for rendering checks. Distinguish file-preview restrictions, engine-loading failures and construction-command errors; respect client access denials.
- Preserve GeoGebra's native frame dimensions, use a transparent frame border, and synchronize the frame and layout backgrounds with the selected theme. This removes exposed white strips in dark mode while keeping the light-mode outer border.
- Hide the native in-canvas style-bar shell and prevent the hidden Algebra Input from leaking a bottom line. The header's object toggle still opens the native editor and input.
- Include the new preview module in the portable Skill runtime distributed through both GitHub and npm, and verify loopback binding, single-document access, Host checks and path confinement.
- Document descriptive construction names to avoid collisions with automatically created polygon sides.

## Install

```sh
npx @lydt/geogebra-studio@0.6.0 install
```

The standalone Skill can also be installed from `YZDame/GeoGebra-Studio`, selecting `geogebra-studio`. Node.js >=22.12 is required. The official GeoGebra engine still requires internet access.

Previously generated HTML files retain their old viewer. Generate a new file with this release to use the fixes. Preview serves a snapshot; restart it after changing its input file.

## Validation

The viewer was checked in the Codex in-app browser using a 3D cube and incircle: light and dark mode, canvas edges, style-bar removal, and native object-panel opening/closing. Build, portable-Skill, export and preview checks and all 92 unit tests passed. These checks cover the tested browser and do not guarantee access through every client's network or content policies.

Publishing the GitHub release triggers the repository's existing npm trusted-publishing workflow, which verifies and publishes the accepted tarball with provenance.
