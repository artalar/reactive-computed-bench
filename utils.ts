export type Rec<T = any> = Record<string, T>

export const POSITION_KEY = 'pos %'

export function printLogs(results: Rec<ReturnType<typeof formatLog>>) {
  const medFastest = Math.min(...Object.values(results).map(({ med }) => med))

  const tabledData = Object.entries(results)
    .sort(([, { med: a }], [, { med: b }]) => a - b)
    .reduce((acc, [name, { min, med, max }]) => {
      acc[name] = {
        [POSITION_KEY]: ((medFastest / med) * 100).toFixed(0),
        'avg ms': med.toFixed(3),
        'min ms': min.toFixed(5),
        'med ms': med.toFixed(5),
        'max ms': max.toFixed(5),
      }
      return acc
    }, {} as Rec<Rec>)

  console.table(tabledData)

  return tabledData
}

export function formatPercent(n = 0) {
  return `${n < 1 ? ` ` : ``}${(n * 100).toFixed(0)}%`
}

export function formatLog(values: Array<number>) {
  return {
    min: min(values),
    med: med(values),
    max: max(values),
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
