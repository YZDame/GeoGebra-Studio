/**
 * Browser half of the GeoGebra Studio plugin.
 *
 * Adds the **GeoGebra Studio** entry to the top of the left sidebar, beside
 * Plugins / Automation / Tasks. Selecting it opens a right-Sidebar tab whose
 * body is a live GeoGebra canvas; the conversation stays in the main column.
 * The canvas starts blank and reloads from the Host's per-Session render
 * version whenever the agent builds a new construction.
 *
 * The entry selects a tiny launcher main panel so the sidebar can address it
 * through the same keyed `main` seat as official panels. The launcher opens the
 * right tab and immediately returns the main column to the Conversation, so a
 * click never replaces the chat with a page.
 */
import { useEffect, useLayoutEffect, useState } from 'react'
import { IconCompareSplitOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'

const NS = 'geogebraStudio'
const PANEL_ID = 'geogebra'
const TAB_KIND = 'geogebra-studio'
const TAB_ID = 'dsh-geogebra-studio'
const STATE_PATH = '/dsh-geogebra-studio/state'
const VIEWER_PATH = '/dsh-geogebra-studio/viewer'

export const name = 'dsh-geogebra-studio'

/** The sidebar, its tab registry, the main-panel selector and copy. */
export const inject = ['slots', 'locale', 'layout', 'sidebarRight', 'sidebarRightTabs']

const zh = {
  panel: 'GeoGebra Studio',
  tab: 'GeoGebra',
}

const en = {
  panel: 'GeoGebra Studio',
  tab: 'GeoGebra',
}

/** The sidebar glyph: the official split-view icon, not a custom mark. */
function GeoGebraPanelIcon({ size }) {
  return <IconCompareSplitOutlineRegular size={size} />
}

/** A blank GeoGebra canvas that follows the Session's latest construction. */
export function GeoGebraCanvas({ sessionId }) {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (sessionId === undefined) return undefined
    setVersion(0)
    let active = true
    let timer
    const poll = async () => {
      try {
        const response = await fetch(
          `${STATE_PATH}?session=${encodeURIComponent(sessionId)}`,
          { cache: 'no-store', credentials: 'same-origin' },
        )
        if (!response.ok) return
        const state = await response.json()
        if (!active) return
        const next = Number(state?.version)
        if (Number.isInteger(next) && next >= 0) {
          setVersion(current => (current === next ? current : next))
        }
      } catch {
        // The Host may still be starting; the next tick retries.
      }
    }
    void poll()
    timer = window.setInterval(poll, 800)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [sessionId])

  if (sessionId === undefined) return null
  const src = `${VIEWER_PATH}?session=${encodeURIComponent(sessionId)}&v=${version}`
  return (
    <div
      data-geogebra-canvas
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 0,
        background: 'var(--dsw-alias-bg-layer-1)',
      }}
    >
      <iframe
        key={src}
        src={src}
        title="GeoGebra Studio"
        allow="clipboard-write; fullscreen"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          border: 0,
        }}
      />
    </div>
  )
}

/** Open the right tab and put the Conversation back in the main column. */
function Launcher({ launch }) {
  useLayoutEffect(() => {
    launch()
  }, [])
  return null
}

/**
 * Register the left-rail entry, its transient launcher panel, the right-Sidebar
 * tab type and the canvas body.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx) {
  const t = ctx.locale.bind(NS)

  ctx.effect(
    () => ctx.locale.register(NS, { zh, en }),
    'geogebra-studio: dictionaries',
  )

  ctx.effect(
    () => ctx.sidebarRightTabs.register({
      id: TAB_ID,
      kind: TAB_KIND,
      title: () => t('tab'),
    }),
    'geogebra-studio: right tab type',
  )

  ctx.effect(
    () => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
      name: 'sidebar.right.pane.tab',
      key: TAB_ID,
      locale: NS,
    }, GeoGebraCanvas)),
    'geogebra-studio: right tab body',
  )

  // The sidebar row's id must address a registered main panel. This one is a
  // pass-through: it opens the right tab and immediately restores the chat.
  ctx.effect(
    () => ctx.slots.inject('main', () => ctx.slots.register({
      name: 'main',
      key: PANEL_ID,
      locale: NS,
      inject: () => ({
        launch: () => {
          // The right Sidebar can only open a tab while the Conversation owns
          // the main column. Restore it first; the tab open then works in the
          // same tick, with one post-mount retry for the first paint.
          ctx.layout.selectPanel(null)
          const open = () => {
            try {
              ctx.sidebarRight.openTab(TAB_KIND)
            } catch {
              // No Session on screen, or the Conversation has not mounted yet.
            }
          }
          open()
          setTimeout(open, 0)
        },
      }),
    }, Launcher)),
    'geogebra-studio: launcher panel',
  )

  ctx.effect(
    () => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
      name: 'sidebar.panellist',
      id: PANEL_ID,
      order: 20,
      locale: NS,
      label: () => t('panel'),
    }, GeoGebraPanelIcon)),
    'geogebra-studio: sidebar entry',
  )
}
