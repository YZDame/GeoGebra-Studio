# Current-state export and provenance

The viewer exposes seven formats: GGB, HTML, PNG, SVG, PDF, XML and TikZ. GGB and XML retain the underlying geometry definitions. Current-state HTML embeds packed GGB and retains manual edits when reopened. Original JSON and HTML files do **not** update after editing.

TikZ must come from the official GeoGebra native PGF exporter, then the bundled Gikz cleaner. The viewer performs both steps. It is a *static visual drawing*, not a dependency-preserving replacement for GGB. If cleaning fails, do not fall back to raw PGF.

For Asymptote and TSQX, obtain the *current* `constructionXml` from the viewer's XML download or `await window.geogebraStudio.snapshot()`, save it as XML, then call the skill-local CLI `export --input ... --format asymptote|tsqx --workspace ... --output ...`. The semantic export preserves supported construction relations (independent points, midpoint, segments, polygons, elementary circles); unsupported constructions fail in strict mode, not silently frozen. The TSQX result is mixed TSQX and injected Asymptote. Compile source when the appropriate tooling is present, then inspect geometric fidelity and labels.

If using the optional CLI TikZ cleaner, pass **native PGF/TikZ text**, not GeoGebra XML. XML is the basis for semantic source exports; the best-quality TikZ uses the viewer's native PGF path.

Always explain unverified geometry, supported subset limitations, label adjustments and any missing tooling.
