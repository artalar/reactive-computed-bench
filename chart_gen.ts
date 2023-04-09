import { writeFile, readFile } from 'fs/promises'
import { cpus } from 'os'
import path from 'path'
import { formatLog, Rec } from './utils'

type LibName = string
type LibValues = ReturnType<typeof formatLog>
type IterationName = number
type IterationValues = Record<LibName, LibValues>
type BenchResults = Record<IterationName, IterationValues>
type Iterations = Array<IterationName>['length']
type Point = [number, number]
type ChartData = Array<{
  name: string
  version: string
  color: string
  min: Point[]
  med: Point[]
  max: Point[]
  medValue: number
  labelY: number
}>

const DOWNLOAD_LIMIT = 500

const CPU = cpus()[0]?.model?.replace(/ /g, '_') ?? 'unknown_cpu'
const POPULAR_CHART_PATH = `./popular_chart_${CPU}.svg`
const ALL_CHART_PATH = `./all_chart_${CPU}.svg`
const CHART_TEMPLATE = './chart_template.svg'
const START_MARK = '<!--CONTENT_START-->'
const END_MARK = '<!--CONTENT_END-->'
const REGEX = new RegExp(`${START_MARK}(.*)${END_MARK}`, 'gms')

const X_START = 100
const X_STEP = 230
const Y_START = 20
const Y_RANGE = 500
const LABEL_HEIGHT = 16

const hsl = (i: number, length: number) => {
  const h = Math.round((i * 360) / length) % 360
  return `hsl(${h}, 90%, 45%)`
}

const PACKAGE_NAMES: Rec<string> = {
  'effector.fork': 'effector',
  frpts: '@frp-ts/core',
  mol: 'mol_wire_lib',
  preact: '@preact/signals-core',
  reatom: '@reatom/core',
  solid: 'solid-js',
  'rx-effects': 'rx-effects',
}

export async function genChart(allResults: BenchResults) {
  const popularLibs = new Array()
  for (const libName of Object.keys(Object.values(allResults)[0]!)) {
    const moduleName = PACKAGE_NAMES[libName] ?? libName
    const moduleUrlName = moduleName.replace('/', '%2F')
    const downloadsUrl = `https://api.npmjs.org/versions/${moduleUrlName}/last-week`
    const downloads = await fetch(downloadsUrl)
      .then((r) => r.json())
      .then(({ downloads }: { downloads: Rec<number> }) =>
        Object.values(downloads).reduce((acc, v) => acc + v, 0),
      )
      .catch((error) => {
        console.error(`Failed to fetch downloads for ${name}`)
        console.log(error)
        return 0
      })
    if (downloads > DOWNLOAD_LIMIT) popularLibs.push(libName)
  }
  const popularResults = Object.fromEntries(
    Object.entries(allResults).map(([iteration, iterationValues]) => [
      iteration,
      Object.fromEntries(
        Object.entries(iterationValues).filter(([libName]) =>
          popularLibs.includes(libName),
        ),
      ),
    ]),
  )

  const template = await readFile(CHART_TEMPLATE, 'utf8')
  const allData = await getChartData(allResults)
  const popularData = await getChartData(popularResults)
  const svgAll = allData.map(getLibSVG).join('')
  const svgPopular = popularData.map(getLibSVG).join('')

  await writeFile(
    ALL_CHART_PATH,
    template.replace(REGEX, START_MARK + svgAll + END_MARK),
  )
  await writeFile(
    POPULAR_CHART_PATH,
    template.replace(REGEX, START_MARK + svgPopular + END_MARK),
  )

  let readme = await readFile('./README.md', 'utf8')
  if (readme.includes(CPU)) {
    readme = readme.replace(
      new RegExp(`### ${CPU}(.|\n)*<!-- ### ${CPU} -->`),
      `### ${CPU}

![](${POPULAR_CHART_PATH})

<details>
<summary>all results</summary>

![](${ALL_CHART_PATH})

</details>

<!-- ### ${CPU} -->`,
    )
  } else {
    readme = readme.replace(
      '## Results',
      `## Results

### ${CPU}

![](${POPULAR_CHART_PATH})

<details>
<summary>all results</summary>

![](${ALL_CHART_PATH})

</details>

<!-- ### ${CPU} -->`,
    )
  }

  await writeFile('./README.md', readme)
}

async function getChartData(results: BenchResults): Promise<ChartData> {
  const fastest = {
    min: [] as Array<Iterations>,
    med: [] as Array<Iterations>,
    max: [] as Array<Iterations>,
  }
  const libsResults: Rec<typeof fastest> = {}
  const data: ChartData = []

  let i = -1
  for (const [iteration, iterationValues] of Object.entries(results)) {
    i++

    if (!fastest.min[i]) fastest.min[i] = Infinity
    if (!fastest.med[i]) fastest.med[i] = Infinity
    if (!fastest.max[i]) fastest.max[i] = Infinity

    for (const [lib, libValues] of Object.entries(iterationValues)) {
      const group = (libsResults[lib] ??= {
        min: [],
        med: [],
        max: [],
      })

      group.min.push(libValues.min)
      group.med.push(libValues.med)
      group.max.push(libValues.max)

      if (libValues.min < fastest.min[i]!) {
        fastest.min[i] = libValues.min
      }

      if (libValues.med < fastest.med[i]!) {
        fastest.med[i] = libValues.med
      }

      if (libValues.max < fastest.max[i]!) {
        fastest.max[i] = libValues.max
      }
    }
  }

  const libsNames = Object.keys(libsResults).sort()

  const toPoint = (v: number, i: number) => getPoint(v, fastest.med[i]!, i)
  for (const [lib, libResults] of Object.entries(libsResults)) {
    const moduleName = PACKAGE_NAMES[lib] || lib
    const color = hsl(libsNames.indexOf(lib), libsNames.length)
    const min = libResults.min.map(toPoint)
    const med = libResults.med.map(toPoint)
    const max = libResults.max.map(toPoint)
    const medValue = libResults.med[0]
    const modulePath = path.join(
      __dirname,
      'node_modules',
      moduleName,
      'package.json',
    )
    const file = await readFile(modulePath, 'utf8')
    const version = JSON.parse(file).version

    data.push({
      name: lib,
      version,
      color,
      min,
      med,
      max,
      medValue,
      labelY: 0,
    })
  }

  data.sort((a, b) => a.medValue - b.medValue)

  data.forEach((el, i, arr) => {
    el.labelY = el.med[0]![1]! + 3

    if (i && el.labelY - arr[i - 1]!.labelY < LABEL_HEIGHT) {
      el.labelY = arr[i - 1]!.labelY + LABEL_HEIGHT
    }
  })

  return data
}

function getPoint(value: number, minValue: number, step: number): Point {
  const x = X_START + X_STEP * step
  const y = Y_START + Y_RANGE * (1 - minValue / value)

  return [x, y]
}

function getLibSVG({
  name: lib,
  color,
  med,
  labelY,
  version,
}: ChartData[number]) {
  return `<g>
    <text
      class="lib-label"
      x="95"
      y="${labelY}"
      fill="${color}"
    >${lib} ${version}</text>
    <polyline
      class="line-med"
      fill="none"
      stroke="${color}" 
      points="${med.map((point) => point.join()).join(' ')}"
    ></polyline>
  </g>`
}
