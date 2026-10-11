# GeoGebra Apps API bridge

The MCP keeps its focused construction and export tools for normal work, and adds
three advanced tools for the public Apps API exposed by its active applet:

- `geogebra_api_list_methods` inspects the actual loaded applet rather than relying
  on a hard-coded list. Method availability can differ by GeoGebra app/version.
- `geogebra_api_call` invokes a listed method with JSON arguments. For one-shot
  callback methods, set `waitForCallbackIndex`; for persistent listeners, put a
  `{"$ggbCallbackId":"id"}` marker at the callback argument position and poll
  `geogebra_api_get_callback_events`. Reuse the same marker to unregister it.
- `geogebra_api_get_callback_events` reads and, by default, clears queued listener
  events. Each queue is capped at 100 events.

Methods that can clear, replace, or remove construction state require
`allowDestructive: true`. This is an explicit guard, not a backup mechanism.

This is a broad JSON bridge to methods exposed by the active applet, not a claim
that every Apps API use case is identical over MCP. The API is designed for
JavaScript inside an embedding page; methods requiring DOM objects, browser file
objects, direct download side effects, or other non-JSON values may need a
purpose-built wrapper. `openFile` and methods absent from the active app are not
available in every app/version.

The server-side applet is also separate from an applet in a generated HTML page.
Calling this MCP bridge changes the server construction. It does not reach into
an arbitrary browser tab. Generated HTML runs the same GeoGebra API in its own
page and provides its own current-state download buttons.
