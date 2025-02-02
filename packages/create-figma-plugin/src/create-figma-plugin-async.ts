import { constants, log } from '@create-figma-plugin/common'
import fs from 'fs-extra'
import { basename, join } from 'path'

import { copyTemplateAsync } from './utilities/copy-template-async.js'
import { createDisplayName } from './utilities/create-plugin-display-name.js'
import { installDependenciesAsync } from './utilities/install-dependencies-async.js'
import { interpolateValuesIntoFilesAsync } from './utilities/interpolate-values-into-files-async.js'
import { resolveCreateFigmaPluginLatestStableVersions } from './utilities/resolve-create-figma-plugin-latest-stable-versions.js'
import { resolveDirectoryPathAsync } from './utilities/resolve-directory-path-async.js'
import { resolveTemplateNameAsync } from './utilities/resolve-template-name-async.js'

export async function createFigmaPluginAsync(options: {
  name?: string
  template?: string
}): Promise<void> {
  try {
    if (typeof options.name !== 'undefined') {
      const directoryPath = join(process.cwd(), options.name)
      if ((await fs.pathExists(directoryPath)) === true) {
        throw new Error(`Directory already exists: ./${options.name}`)
      }
    }
    const templateName = await resolveTemplateNameAsync(options.template)
    const name =
      typeof options.name !== 'undefined'
        ? options.name
        : basename(templateName)
    const directoryPath = await resolveDirectoryPathAsync(name)
    log.info(`Copying "${templateName}" template...`)
    await copyTemplateAsync(templateName, directoryPath)
    log.info('Resolving package versions...')
    const versions = await resolveCreateFigmaPluginLatestStableVersions()
    await interpolateValuesIntoFilesAsync(directoryPath, {
      displayName: createDisplayName(name),
      name,
      versions: {
        createFigmaPlugin: versions,
        figma: constants.packageJson.versions
      }
    })
    log.info('Installing dependencies...')
    await installDependenciesAsync(directoryPath)
    log.success('Done')
  } catch (error: any) {
    log.error(error.message)
    process.exit(1)
  }
}
