import { formatLog, Rec } from './utils'
import { writeFile, readFile } from 'fs/promises'
import { cpus } from 'os'

type BenchData = Rec<ReturnType<typeof formatLog>> | undefined
type BenchResults = Rec<BenchData>
type Point = [number, number]

interface ChartData {
  lib: string
  color: string
  min: Point[]
  med: Point[]
  max: Point[]
  labelY: number
}

const CPU = cpus()[0]?.model?.replace(/ /g, '_') ?? 'unknown_cpu'
const CHART_NAME = `./chart_${CPU}.svg`
const CHART_TEMPLATE = './chart_template.svg'
const START_MARK = '<!--CONTENT_START-->'
const END_MARK = '<!--CONTENT_END-->'
const REGEX = new RegExp(`${START_MARK}(.*)${END_MARK}`, 'gms')

const X_START = 100
const X_STEP = 230
const Y_START = 20
const Y_RANGE = 500
const LABEL_HEIGHT = 16

const PALETTE = [
  '#e60049',
  '#0bb4ff',
  '#50e991',
  '#e6d800',
  '#9b19f5',
  '#ffa300',
  '#dc0ab4',
  '#b3d4ff',
  '#00bfa0',
]

export async function genChart(results: BenchResults) {
  const template = await readFile(CHART_TEMPLATE, 'utf8')

  await writeFile(
    CHART_NAME,
    template.replace(REGEX, START_MARK + getSVGString(results) + END_MARK),
  )

  let readme = await readFile('./README.md', 'utf8')
  if (readme.includes(CPU)) {
    readme = readme.replace(
      new RegExp(`### ${CPU}(.|\n)*#`),
      `### ${CPU}

![](${CHART_NAME})

#`,
    )
  } else {
    readme = readme.replace(
      '## Results',
      `## Results

### ${CPU}

![](${CHART_NAME})
`,
    )
  }

  await writeFile('./README.md', readme)
}

function getSVGString(results: BenchResults) {
  return getChartData(results).map(getLibSVG).join('')
}

function getChartData(results: BenchResults) {
  const grouped: Record<
    string,
    {
      min: number[]
      med: number[]
      max: number[]
    }
  > = {}

  const arr: {
    lib: string
    min: number[]
    med: number[]
    max: number[]
  }[] = []

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

  for (let name in grouped) {
    arr.push({
      lib: name,
      ...grouped[name]!,
    })
  }

  arr.sort((a, b) => a.med[0]! - b.med[0]!)

  const toPoint = (v: number, i: number) => getPoint(v, fastest.med[i]!, i)
  const data = arr
    .map(({ lib, min, med, max }, i) => {
      return {
        lib,
        color: PALETTE[i % PALETTE.length],
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

function getLibSVG({ lib, color, med, labelY }: ChartData) {
  return `<g>
    <text
      class="lib-label"
      x="92"
      y="${labelY}"
      fill="${color}"
    >${lib}</text>
    <polyline
      class="line-med"
      fill="none"
      stroke="${color}" 
      points="${med.map((point) => point.join()).join(' ')}"
    ></polyline>
  </g>`
}
