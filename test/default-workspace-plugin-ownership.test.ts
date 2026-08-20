import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

describe('default workspace plugin ownership', () => {
  it('leaves the npm bundle as the only Host component registration', async () => {
    const deployment = parse(
      await readFile('build/dsh-desktop.patch.yml', 'utf8')
    ) as Array<{ insert?: Array<{ id?: string; name?: string }> }>
    const manifest = JSON.parse(await readFile('package.json', 'utf8')) as {
      dependencies: Record<string, string>
    }
    const inserted = deployment.flatMap((entry) => entry.insert ?? [])

    expect(inserted).not.toContainEqual(
      expect.objectContaining({ id: 'dsh-desktop-temporary-workspace' })
    )
    expect(manifest.dependencies).not.toHaveProperty(
      'dsh-desktop-temporary-workspace'
    )
  })
})
