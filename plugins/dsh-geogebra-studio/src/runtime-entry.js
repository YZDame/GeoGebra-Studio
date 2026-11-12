/**
 * Entry points bundled into `runtime/geogebra.mjs` for the DeepSeek Harness
 * plugin. The plugin must not reach outside its own package: the root `dist/`
 * tree is only a build-time input.
 */
export { generateViewer, validateViewerSpec } from '../../../src/studio/generate.ts'
export { previewViewer } from '../../../src/studio/preview.ts'
export { sceneFromXML, exportSource } from '../../../src/export/semantic.ts'
export { cleanWithGikz } from '../../../src/export/gikz.ts'
export { saveText } from '../../../src/export/files.ts'
export { inWorkspace } from '../../../src/export/workspace.ts'
