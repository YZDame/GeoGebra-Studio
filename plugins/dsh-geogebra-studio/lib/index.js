/**
 * Host half of the DeepSeek Harness sidebar plugin.
 *
 * `dsh plugin add` mounts this package through cordis.patch.yml. The sidebar
 * button is the client bundle (`exports["./client"]`), which registers
 * `sidebar.footer.action`. This host entry intentionally registers no tools
 * and no HTTP routes: figure generation stays in the geogebra-studio Skill.
 */

export const name = 'dsh-geogebra-studio'

export const inject = []

export function apply() {}
