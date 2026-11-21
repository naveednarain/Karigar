import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SKILL_DIR = 'C:/Users/Medico Engineer/.codex/plugins/cache/openai-primary-runtime/presentations/26.1112.11217/skills/presentations';
const workspaceDir = 'D:/Karigar';
const candidatePath = 'D:/Karigar/.karigar-deck-build/Karigar-Overview-draft.pptx';
const finalPath = 'D:/Karigar/deck-output/Karigar-Project-Overview.pptx';
const RUNTIME_PYTHON = 'C:/Users/Medico Engineer/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const stagingDir = path.join(workspaceDir, '.codex-finalizer');
const { finalizePresentation } = await import(pathToFileURL(path.join(SKILL_DIR, 'container_tools/artifact_tool_utils.mjs')).href);

const result = await finalizePresentation({
  explicitTotalSlideCount: 10,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(SKILL_DIR, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  fontPolicy: { basis: 'design', families: ['Segoe UI'] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, 'Karigar-Project-Overview.validation.json'),
});
console.log(JSON.stringify(result, null, 2));
