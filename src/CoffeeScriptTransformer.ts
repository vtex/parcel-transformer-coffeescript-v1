import { Transformer } from '@parcel/plugin'
import SourceMap from '@parcel/source-map'
import coffee from 'coffeescript'
import { relativeUrl } from '@parcel/utils'

export default new Transformer({
  async transform({ asset, options }) {
    const sourceFileName: string = relativeUrl(
      options.projectRoot,
      asset.filePath
    )

    asset.type = 'js'
    const output = coffee.compile(await asset.getCode(), {
      filename: sourceFileName,
      sourceMap: !!asset.env.sourceMap,
      bare: true,
    })

    // return from compile is based on sourceMap option
    if (asset.env.sourceMap) {
      let map = null

      if (output.v3SourceMap) {
        // @ts-expect-error: wrong typings
        map = new SourceMap(options.projectRoot)
        map.addVLQMap(JSON.parse(output.v3SourceMap))
      }

      asset.setCode(output.js)
      asset.setMap(map)
    } else {
      asset.setCode(output)
    }

    return [asset]
  },
})
