---
name: geogebra-setup
description: Set up the GeoGebra geometry plugin from a local checkout and diagnose its Node, Chromium, Gikz, and export-toolchain dependencies.
---

Locate this plugin's root from the current skill path. Check Node >=22.12.0,
`package.json`, and `dist/cli.js`. In a source checkout run `npm ci` then
`npm run build`. The bundled MCP configuration runs `node ./dist/cli.js` with
`cwd` set to the plugin root. For a client that does not resolve plugin-relative
working directories, configure the absolute CLI path explicitly.

Use `server_info` and `geogebra_instance_status` to inspect connection and engine
state. HTML generation works without Chromium. For server-side rendering, install
Puppeteer's browser with `npx puppeteer browsers install chrome` or set
`PUPPETEER_EXECUTABLE_PATH` to an existing compatible Chrome executable. Check
network access to GeoGebra if loading fails. Do not report mock results as live exports.

Gikz is optional: configure `GIKZ_CLI` with an absolute path to its separately
installed `gikz.js`. Keep GPL notices with that installation. Do not auto-download
or execute a replacement CLI merely because an export reports it missing.

`pdflatex`, `asy`, and `tsqx` are optional source-verification tools; their absence
does not prevent native GGB/PNG/SVG/PDF exports. Do not overwrite the user's MCP
configuration or publish a server as part of setup unless requested.

The bundled Streamable HTTP mode binds only to loopback and shares one workspace
construction. Public ChatGPT connections need a separately deployed HTTPS endpoint
and appropriate authentication/isolation. Installing a local plugin does not
publish it to a directory or verify ChatGPT UI compatibility.
