export type Rec<T = any> = Record<string, T>

export function printLogs(results: Rec<ReturnType<typeof formatLog>>) {
  const medFastest = Math.min(...Object.values(results).map(({ med }) => med))

  const tabledData = Object.entries(results)
    .sort(([, { med: a }], [, { med: b }]) => a - b)
    .reduce((acc, [name, { min, med, max, complexity }]) => {
      acc[name] = {
        'pos %': Math.round((medFastest / med) * 100),
        // 'avg ms': med.toFixed(3),
        'min ms': Number(min.toFixed(4)),
        'med ms': Number(med.toFixed(4)),
        'max ms': Number(max.toFixed(4)),
        'complex': complexity,
      }
      return acc
    }, {} as Rec<Rec>)

  console.table(tabledData)
}

export function formatPercent(n = 0) {
  return `${n < 1 ? ` ` : ``}${(n * 100).toFixed(0)}%`
}

export function getComplexity(fn: Function) {
  return fn.toString()
    .replace( /\/\/.*$/gm, '' ) // drop comments
    .replace( /__\w+\(.*?\);/g, '_' ) // drop generated decoration
    .match( /\w+/g )?.length ?? 0 // calc named tokens
}

export function formatLog(values: Array<number>, complexity: number) {
  return {
    min: min(values),
    med: med(values),
    max: max(values),
    complexity,
  }
}

export function med(values: Array<number>) {
  if (values.length === 0) return 0

  values = values.map((v) => +v)

  values.sort((a, b) => (a - b < 0 ? 1 : -1))

  var half = Math.floor(values.length / 2)

  if (values.length % 2) return values[half]!

  return (values[half - 1]! + values[half]!) / 2.0
}

export function min(values: Array<number>) {
  if (values.length === 0) return 0

  values = values.map((v) => +v)

  values.sort((a, b) => (a - b < 0 ? -1 : 1))

  const limit = Math.floor(values.length / 20)

  return values[limit]!
}

export function max(values: Array<number>) {
  if (values.length === 0) return 0

  values = values.map((v) => +v)

  values.sort((a, b) => (a - b < 0 ? -1 : 1))

  const limit = values.length - 1 - Math.floor(values.length / 20)

  return values[limit]!
}
