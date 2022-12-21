import { writeFile, readFile } from 'fs/promises'
import { cpus } from 'os'
import path from 'path'
import { formatLog, Rec } from './utils'

type BenchData = Rec<ReturnType<typeof formatLog>> | undefined
type BenchResults = Rec<BenchData>
type Point = [number, number]

interface ChartData {
  lib: string
  version: string
  color: string
  min: Point[]
  med: Point[]
  max: Point[]
  labelY: number
}

const CPU = cpus()[0]?.model?.replace(/ /g, '_') ?? 'unknown_cpu'
const CHART_PATH = `./chart_${CPU}.svg`
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

const PACKAGES = {
  'effector.fork': 'effector',
  's.js': 's-js',
  frpts: '@frp-ts/core',
  mol: 'mol_wire_lib',
  preact: '@preact/signals-core',
  reatom: '@reatom/core',
  solid: 'solid-js',
}

export async function genChart(results: BenchResults) {
  const template = await readFile(CHART_TEMPLATE, 'utf8')

  await writeFile(
    CHART_PATH,
    template.replace(
      REGEX,
      START_MARK + (await getSVGString(results)) + END_MARK,
    ),
  )

  let readme = await readFile('./README.md', 'utf8')
  if (readme.includes(CPU)) {
    readme = readme.replace(
      new RegExp(`### ${CPU}(.|\n)*<!-- ### ${CPU} -->`),
      `### ${CPU}

![](${CHART_PATH})

<!-- ### ${CPU} -->`,
    )
  } else {
    readme = readme.replace(
      '## Results',
      `## Results

### ${CPU}

![](${CHART_PATH})

<!-- ### ${CPU} -->`,
    )
  }

  await writeFile('./README.md', readme)
}

async function getSVGString(results: BenchResults) {
  const data = await getChartData(results)
  return data.map(getLibSVG).join('')
}

async function getChartData(results: BenchResults) {
  const grouped: Record<
    string,
    {
      min: number[]
      med: number[]
      max: number[]
    }
  > = {}

  const arr: Array<{
    lib: string
    version: string
    color: string
    min: number[]
    med: number[]
    max: number[]
  }> = []

  const fastest = {
    min: [] as number[],
    med: [] as number[],
    max: [] as number[],
  }

  let i = 0

  for (let iterations in results) {
    const libs = results[iterations]

    if (!fastest.min[i]) fastest.min[i] = Infinity
    if (!fastest.med[i]) fastest.med[i] = Infinity
    if (!fastest.max[i]) fastest.max[i] = Infinity

    for (let name in libs) {
      const lib = libs[name]!
      const group = (grouped[name] ??= {
        min: [],
        med: [],
        max: [],
      })

      group.min.push(lib.min)
      group.med.push(lib.med)
      group.max.push(lib.max)

      if (lib.min < fastest.min[i]!) {
        fastest.min[i] = lib.min
      }

      if (lib.med < fastest.med[i]!) {
        fastest.med[i] = lib.med
      }

      if (lib.max < fastest.max[i]!) {
        fastest.max[i] = lib.max
      }
    }

    i++
  }

  const libsNames = Object.keys(grouped).sort()

  for (let lib in grouped) {
    // @ts-expect-error
    const moduleName = PACKAGES[lib] || lib
    const modulePath = path.join(
      __dirname,
      'node_modules',
      moduleName,
      'package.json',
    )

    const file = await readFile(modulePath, 'utf8')
    const version = JSON.parse(file).version

    arr.push({
      lib,
      version,
      color: hsl(libsNames.indexOf(lib), libsNames.length),
      ...grouped[lib]!,
    })
  }

  arr.sort((a, b) => a.med[0]! - b.med[0]!)

  const toPoint = (v: number, i: number) => getPoint(v, fastest.med[i]!, i)
  const data = arr
    .map(({ lib, version, color, min, med, max }) => {
      return {
        lib,
        version,
        color,
        min: min.map(toPoint),
        med: med.map(toPoint),
        max: max.map(toPoint),
        labelY: 0,
      }
    })
    .map((el, i, arr) => {
      el.labelY = el.med[0]![1]! + 3

      if (i && el.labelY - arr[i - 1]!.labelY < LABEL_HEIGHT) {
        el.labelY = arr[i - 1]!.labelY + LABEL_HEIGHT
      }
      return el
    })

  return data as ChartData[]
}

function getPoint(value: number, minValue: number, step: number) {
  const x = X_START + X_STEP * step
  const y = Y_START + Y_RANGE * (1 - minValue / value)

  return [x, y]
}

function getLibSVG({ lib, color, med, labelY, version }: ChartData) {
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
