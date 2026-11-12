# Installation and troubleshooting

The DeepSeek Harness plugin is self-contained. Once published to npm, `dsh plugin --profile web add dsh-geogebra-studio` installs the Host tools, the bundled runtime and the `geogebra-studio` skill together. Before that release, use `dsh plugin --profile web add ./plugins/dsh-geogebra-studio` or the quoted GitHub path. Restart `dsh web` or the Desktop app afterwards.

Do not run `dsh plugin add` on the repository root, on `@lydt/geogebra-studio`, or on a skill directory. Do not copy `runtime/` or `skills/` out of the plugin; the `files` list already packages them.

## Check the installation

1. **Plugins** shows **GeoGebra Studio** with a geometry icon and a description that names the three tools. A disabled row, or a row from an older `dsh-geogebra-studio` version, means the profile still has the guide-only button; reinstall and restart.
2. A new session lists `geogebra_build`, `geogebra_preview` and `geogebra_export`, and its skill catalog contains `geogebra-studio`.
3. Run `dsh --profile web --dump-config` and look for `# == dsh-geogebra-studio` with `name: dsh-geogebra-studio`. A missing row means the bundle patch did not load.

The composed row proves the bundle resolved; it does not prove the tools registered. If the session shows no tools, read the Host log for an activation error. This plugin imports only its own bundled runtime, so a module-resolution failure points to a damaged package rather than missing peer dependencies.

## Tool errors

- `workspace must be an absolute directory path` — pass `workspace` explicitly, or call the tool from a session that has a working directory.
- `input path is outside workspace` / `Export path is outside workspace` — inputs and outputs are confined to the workspace, and symlinked escapes are rejected by design.
- `EEXIST` — generation and export never overwrite. Choose a new filename instead of retrying the same path.
- `TikZ export reads native GeoGebra PGF output` — download the viewer's current PGF for TikZ; XML is only for TSQX and Asymptote.
- `requires review` / unsupported relation — strict semantic export refused to freeze a dependency. Keep the construction XML, simplify the relation, or export a format that preserves it.

## Rendering

`geogebra_preview` serves one HTML snapshot on `127.0.0.1`. It does not proxy the GeoGebra engine: the browser needs internet access for the official CDN. `GeoGebra failed to load` means the engine bootstrap failed; inspect network and content-security-policy errors in the intended browser. A terminal CDN check does not prove client access. `Command N failed` means the engine loaded and the construction itself must be fixed.

The preview server accepts only that one document and closes when the plugin unloads. Opening a static file-preview pane instead of the loopback URL can block the engine's scripts; it does not count as browser verification. Confirm `window.geogebraStudio.status === "ready"` and inspect the drawing before reporting rendering success.

GeoGebra Studio is an independent project and is not affiliated with GeoGebra.
