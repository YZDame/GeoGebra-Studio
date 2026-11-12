# Installation and troubleshooting

The DeepSeek Harness plugin is self-contained and published as `dsh-geogebra-studio`. `dsh plugin --profile web add dsh-geogebra-studio` installs the Host tools, the bundled runtime and the `geogebra-studio` skill together. When testing a branch, use `dsh plugin --profile web add ./plugins/dsh-geogebra-studio` or the quoted GitHub path. Restart `dsh web` or the Desktop app afterwards.

Do not run `dsh plugin add` on the repository root, on `@lydt/geogebra-studio`, or on a skill directory. Do not copy `runtime/` or `skills/` out of the plugin; the `files` list already packages them.

## Check the installation

1. The left sidebar shows **GeoGebra Studio** beside Plugins, Automation and Tasks, using DSH's official split-view icon. Selecting it opens a blank canvas in the right sidebar while the conversation stays in the main column.
2. A new session lists `geogebra_build`, `geogebra_preview` and `geogebra_export`, and its skill catalog contains `geogebra-studio`.
3. **Plugins** lists the package with its title and description; the package ships no custom artwork, so DSH draws its official default plugin mark.
4. Run `dsh --profile web --dump-config` and look for `# == dsh-geogebra-studio` with `name: dsh-geogebra-studio`. A missing row means the bundle patch did not load.

A 0.2.0 install still shows the old footer guide; reinstall and restart to get the left-rail entry and right canvas.

The composed row proves the bundle resolved; it does not prove the tools registered. If the session shows no tools, read the Host log for an activation error. This plugin imports only its own bundled runtime, so a module-resolution failure points to a damaged package rather than missing peer dependencies.

If the left entry opens but the canvas stays blank after `geogebra_build`, the Host web server or its bridge routes are unavailable. The canvas reads `/dsh-geogebra-studio/state?session=<sessionId>` and embeds `/dsh-geogebra-studio/viewer?session=<sessionId>`; both are registered by the Host half when the profile mounts `webServer`. Check that the session id matches and restart after installing a new Host version.

## Tool errors

- `workspace must be an absolute directory path` — pass `workspace` explicitly, or call the tool from a session that has a working directory.
- `input path is outside workspace` / `Export path is outside workspace` — inputs and outputs are confined to the workspace, and symlinked escapes are rejected by design.
- `EEXIST` — generation and export never overwrite. Choose a new filename instead of retrying the same path.
- `TikZ export reads native GeoGebra PGF output` — download the viewer's current PGF for TikZ; XML is only for TSQX and Asymptote.
- `requires review` / unsupported relation — strict semantic export refused to freeze a dependency. Keep the construction XML, simplify the relation, or export a format that preserves it.

## Rendering

The right-side canvas embeds the same viewer HTML as `geogebra_preview`, including its template header (objects toggle, theme, light/dark, downloads). It does not proxy the GeoGebra engine: the browser needs internet access for the official CDN. `GeoGebra failed to load` means the engine bootstrap failed; inspect network and content-security-policy errors in the intended browser. A terminal CDN check does not prove client access. `Command N failed` means the engine loaded and the construction itself must be fixed.

The canvas reloads whenever the Host records a new build for that Session; the previous figure is replaced. `geogebra_preview` remains available for a standalone loopback link and closes when the plugin unloads. Confirm `window.geogebraStudio.status === "ready"` in the canvas and inspect the drawing before reporting rendering success.

GeoGebra Studio is an independent project and is not affiliated with GeoGebra.
