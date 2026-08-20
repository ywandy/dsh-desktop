import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const patchPath = 'patches/@deepseek-ai+dsh-client-ui-workspace+0.1.0-rc.7.patch'
const clientBundlePath =
  'node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js'

describe('workspace create-source extension patch', () => {
  it('declares independent list slots for both workspace creation surfaces', async () => {
    const patch = await readFile(patchPath, 'utf8')

    expect(patch).toContain('conversation.hero.workspace.createSource')
    expect(patch).toContain('sidebar.workspaces.createSource')
    expect(patch.match(/kind: "list"/gu)).toHaveLength(2)
  })

  it('projects ordered source entries into the existing workspace menu', async () => {
    const patch = await readFile(patchPath, 'utf8')

    expect(patch).toContain('left.order - right.order')
    expect(patch).toContain('CREATE_SOURCE_PREFIX')
    expect(patch).toContain('footer: sourceEntries')
  })

  it('renders only the selected source and adopts its returned path', async () => {
    const patch = await readFile(patchPath, 'utf8')

    expect(patch).toContain('{ only: selectedSourceId }')
    expect(patch).toContain('createWorkspace({ path })')
    expect(patch).toContain('startSession(workspaceId)')
  })

  it('routes submit sources without opening their source component', async () => {
    const patch = await readFile(patchPath, 'utf8')

    expect(patch).toContain(
      'activation: entry.options.activation ?? sourceInject.activation ?? "immediate"'
    )
    expect(patch).toContain('create: entry.options.create')
    expect(patch).toContain('const sourceInject = entry.inject?.() ?? {}')
    expect(patch).toContain('sourceInject.activation ?? "immediate"')
    expect(patch).toContain('entry.options.create ?? sourceInject.create')
    expect(patch).toContain('source.activation === "submit"')
    expect(patch).toContain('workspace/create-source-deferred')
    expect(patch).toContain('workspace/create-source-clear')
    expect(patch).toContain('ctx.sessions.clear()')
  })

  it('clears the current session before publishing a deferred source', async () => {
    const bundle = await readFile(clientBundlePath, 'utf8')
    const functionBody = bundle.match(
      /const deferSource = \(source, clearSession\) => \{([\s\S]*?)\n\t\t\t\};/u
    )?.[1]

    expect(functionBody).toBeDefined()

    const calls: string[] = []
    const ctx = {
      emit: (event: string) => calls.push(event),
      sessions: { clear: () => calls.push('sessions/clear') }
    }
    const deferSource = Function(
      'ctx',
      `return (source, clearSession) => {${functionBody ?? ''}\n}`
    )(ctx) as (source: object, clearSession: boolean) => void

    deferSource({ id: 'temporary' }, true)

    expect(calls).toEqual([
      'sessions/clear',
      'workspace/create-source-deferred'
    ])
  })
})
