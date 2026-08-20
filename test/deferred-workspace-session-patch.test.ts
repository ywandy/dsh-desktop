import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const patchPath =
  'patches/@deepseek-ai+dsh-client-ui-conversation+0.1.0-rc.7.patch'

describe('deferred standalone workspace session patch', () => {
  it('keeps a pending composer without a host session', async () => {
    const patch = await readFile(patchPath, 'utf8')

    expect(patch).toContain('DeferredSessionCoordinator')
    expect(patch).toContain('pendingShell')
    expect(patch).toContain('workspace/create-source-deferred')
    expect(patch).toContain('workspace/create-source-clear')
  })

  it('creates an ungrouped cwd session only on submit', async () => {
    const patch = await readFile(patchPath, 'utf8')

    expect(patch).toContain('sessions.create({ cwd: attempt.path })')
    expect(patch).toContain('conversation.sendSession(binding.session')
    expect(patch).toContain('attempt.sessionId ??=')
    expect(patch).not.toContain('workspaces.create({ path: attempt.path })')
  })
})
