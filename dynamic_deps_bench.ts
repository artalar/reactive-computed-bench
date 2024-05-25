import { forEach } from 'wonka'
import { printLogs, formatLog, POSITION_KEY } from './utils'

async function testAggregateGrowing(count: number, method: 'push' | 'unshift') {
  const mol_wire_lib = await import('mol_wire_lib')
  const { $mol_wire_atom } = mol_wire_lib.default

  const { atom, createCtx } = await import('@reatom/core')

  const V4 = await import('../../reatom4/packages/core/build')

  const { observable, computed, autorun, configure } = await import('mobx')
  configure({ enforceActions: 'never' })

  const { act } = await import('@artalar/act')

  const molAtoms = [new $mol_wire_atom(`0`, (next: number = 0) => next)]
  const reAtoms = [atom(0, `${0}`)]
  const V4Atoms = [V4.atom(0, `${0}`)]
  const mobxAtoms = [observable.box(0, { name: `${0}` })]
  const actAtoms = [act(0)]

  const molAtom = new $mol_wire_atom(`sum`, () =>
    molAtoms.reduce((sum, atom) => sum + atom.sync(), 0),
  )
  const reAtom = atom(
    (ctx) => reAtoms.reduce((sum, atom) => sum + ctx.spy(atom), 0),
    `sum`,
  )
  const V4Atom = V4.atom(
    () => V4Atoms.reduce((sum, atom) => sum + atom(), 0),
    `sum`,
  )
  const mobxAtom = computed(
    () => mobxAtoms.reduce((sum, atom) => sum + atom.get(), 0),
    { name: `sum` },
  )
  const actAtom = act(() => actAtoms.reduce((sum, a) => sum + a(), 0))

  const ctx = createCtx()
  const V4Root = V4.AsyncContext.Snapshot.createRoot()

  ctx.subscribe(reAtom, () => {})
  V4.effect(() => V4Atom()).run(V4Root.frame)
  molAtom.sync()
  autorun(() => mobxAtom.get())
  actAtom.subscribe(() => {})

  const reatomLogs = new Array<number>()
  const V4Logs = new Array<number>()
  const molLogs = new Array<number>()
  const mobxLogs = new Array<number>()
  const actLogs = new Array<number>()
  let i = 1
  while (i++ < count) {
    const startReatom = performance.now()
    reAtoms[method](atom(i, `${i}`))
    reAtoms.at(-2)!(ctx, i)
    reatomLogs.push(performance.now() - startReatom)

    const startMol = performance.now()
    molAtoms[method](new $mol_wire_atom(`${i}`, (next: number = i) => next))
    molAtoms.at(-2)!.put(i)
    molAtom.sync()
    molLogs.push(performance.now() - startMol)

    const startMobx = performance.now()
    mobxAtoms[method](observable.box(i, { name: `${i}` }))
    mobxAtoms.at(-2)!.set(i)
    mobxLogs.push(performance.now() - startMobx)

    const startV4 = performance.now()
    V4Root.run(() => {
      V4Atoms[method](V4.atom(i))
      V4Atoms.at(-2)!(i)
      V4.notify()
    })
    V4Logs.push(performance.now() - startV4)

    const startAct = performance.now()
    actAtoms[method](act(i))
    actAtoms.at(-2)!(i)
    act.notify()
    actLogs.push(performance.now() - startAct)

    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  if (
    new Set([
      molAtom.sync(),
      ctx.get(reAtom),
      mobxAtom.get(),
      actAtom(),
      V4Root.run(V4Atom),
    ]).size > 1
  ) {
    throw new Error(
      'Mismatch: ' +
        JSON.stringify({
          mol: molAtom.sync(),
          reatom: ctx.get(reAtom),
          mobx: mobxAtom.get(),
          act: actAtom(),
          V4: V4Root.run(V4Atom),
        }),
    )
  }

  console.log(
    `Median of sum calc of reactive nodes in list from 1 to ${count} (with "${method}")`,
  )

  return printLogs({
    reatom: formatLog(reatomLogs),
    $mol_wire: formatLog(molLogs),
    mobx: formatLog(mobxLogs),
    // act: formatLog(actLogs),
    V4: formatLog(V4Logs),
  })
}

async function testAggregateShrinking(count: number, method: 'pop' | 'shift') {
  const mol_wire_lib = await import('mol_wire_lib')
  const { $mol_wire_atom } = mol_wire_lib.default

  const { atom, createCtx } = await import('@reatom/core')

  const V4 = await import('../../reatom4/packages/core/build')

  const { observable, computed, autorun, configure } = await import('mobx')
  configure({ enforceActions: 'never' })

  const molAtoms = Array.from(
    { length: count },
    (_, i) => new $mol_wire_atom(`${i}`, (next: number = 1) => next),
  )
  const reAtoms = Array.from({ length: count }, (_, i) => atom(1, `${i}`))
  const V4Atoms = Array.from({ length: count }, (_, i) => V4.atom(1, `${i}`))
  const mobxAtoms = Array.from({ length: count }, (_, i) =>
    observable.box(1, { name: `${i}` }),
  )

  const molAtom = new $mol_wire_atom(`sum`, () =>
    molAtoms.reduce((sum, atom) => sum + atom.sync(), 0),
  )
  const reAtom = atom(
    (ctx) => reAtoms.reduce((sum, atom) => sum + ctx.spy(atom), 0),
    `sum`,
  )
  const V4Atom = V4.atom(
    () => V4Atoms.reduce((sum, atom) => sum + atom(), 0),
    `sum`,
  )
  const mobxAtom = computed(
    () => mobxAtoms.reduce((sum, atom) => sum + atom.get(), 0),
    { name: `sum` },
  )

  const ctx = createCtx()
  const V4Root = V4.AsyncContext.Snapshot.createRoot()

  ctx.subscribe(reAtom, () => {})
  V4.effect(() => V4Atom()).run(V4Root.frame)
  molAtom.sync()
  autorun(() => mobxAtom.get())

  const reatomLogs = new Array<number>()
  const V4Logs = new Array<number>()
  const molLogs = new Array<number>()
  const mobxLogs = new Array<number>()
  let i = 1
  while (i++ < count) {
    const startReatom = performance.now()
    reAtoms[method]()!(ctx, i)
    reatomLogs.push(performance.now() - startReatom)

    const startV4 = performance.now()
    V4Root.run(() => {
      V4Atoms[method]()!(i)
      V4.notify()
    })
    V4Logs.push(performance.now() - startV4)

    const startMol = performance.now()
    molAtoms[method]()!.put(i)
    molAtom.sync()
    molLogs.push(performance.now() - startMol)

    const startMobx = performance.now()
    mobxAtoms[method]()!.set(i)
    mobxLogs.push(performance.now() - startMobx)

    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  if (
    new Set([
      molAtom.sync(),
      ctx.get(reAtom),
      V4Root.run(V4Atom),
      mobxAtom.get(),
    ]).size > 1
  ) {
    throw new Error(
      'Mismatch: ' +
        JSON.stringify({
          mol: molAtom.sync(),
          reatom: ctx.get(reAtom),
          V4: V4Root.run(V4Atom),
          mobx: mobxAtom.get(),
        }),
    )
  }

  console.log(
    `Median of sum calc of reactive nodes in list from ${count} to 1 (with "${method}")`,
  )

  return printLogs({
    reatom: formatLog(reatomLogs),
    $mol_wire: formatLog(molLogs),
    mobx: formatLog(mobxLogs),
    // act: formatLog(actLogs),
    V4: formatLog(V4Logs),
  })
}

async function testParent(count: number) {
  const mol_wire_lib = await import('mol_wire_lib')
  const { $mol_wire_atom } = mol_wire_lib.default

  const { atom, createCtx } = await import('@reatom/core')

  const V4 = await import('../../reatom4/packages/core/build')

  const { observable, computed, autorun, configure } = await import('mobx')
  configure({ enforceActions: 'never' })

  const molAtom = new $mol_wire_atom(`0`, (next: number = 0) => next)
  const molAtoms = []
  const reAtom = atom(0, `${0}`)
  const V4Atom = V4.atom(0, `${0}`)
  const mobxAtom = observable.box(0, { name: `${0}` })

  const ctx = createCtx()
  const V4Root = V4.AsyncContext.Snapshot.createRoot()

  {
    let i = count
    while (i--) {
      const molPubAtom = new $mol_wire_atom(`${i}`, () => molAtom.sync())
      molPubAtom.sync()
      molAtoms.push(molPubAtom)

      ctx.subscribe(
        atom((ctx) => ctx.spy(reAtom)),
        () => {},
      )

      const V4DepAtom = V4.atom(() => V4Atom())
      V4.effect(() => V4DepAtom()).run(V4Root.frame)

      const mobxDepAtom = computed(() => mobxAtom.get())
      autorun(() => mobxDepAtom.get())
    }
  }

  const reatomLogs = new Array<number>()
  const V4Logs = new Array<number>()
  const molLogs = new Array<number>()
  const mobxLogs = new Array<number>()
  let i = count
  while (i--) {
    const startReatom = performance.now()
    reAtom(ctx, i)
    reatomLogs.push(performance.now() - startReatom)

    const startV4 = performance.now()
    V4Root.run(() => {
      V4Atom(i)
      V4.notify()
    })
    V4Logs.push(performance.now() - startV4)

    const startMol = performance.now()
    molAtom.put(i)
    molAtoms.forEach((atom) => atom.sync())
    molLogs.push(performance.now() - startMol)

    const startMobx = performance.now()
    mobxAtom.set(i)
    mobxLogs.push(performance.now() - startMobx)

    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  if (
    new Set([
      molAtom.sync(),
      ctx.get(reAtom),
      V4Root.run(V4Atom),
      mobxAtom.get(),
    ]).size > 1
  ) {
    throw new Error(
      'Mismatch: ' +
        JSON.stringify({
          mol: molAtom.sync(),
          reatom: ctx.get(reAtom),
          V4: V4Root.run(V4Atom),
          mobx: mobxAtom.get(),
        }),
    )
  }

  console.log(`Median of update 1 node with ${count} reactive children`)

  return printLogs({
    reatom: formatLog(reatomLogs),
    $mol_wire: formatLog(molLogs),
    mobx: formatLog(mobxLogs),
    // act: formatLog(actLogs),
    V4: formatLog(V4Logs),
  })
}

;(async () => {
  // const subscribers = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]
  const subscribers = [1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 10]

  for (const i of subscribers) {
    var results = [
      await testAggregateGrowing(i, 'push'),
      await testAggregateGrowing(i, 'unshift'),
      await testAggregateShrinking(i, 'pop'),
      await testAggregateShrinking(i, 'shift'),
      // await testParent(i),
    ]
  }

  console.log('\nAVERAGE for', subscribers.join(','), 'subscribers')

  Object.keys(results![0])
    .map((name) => ({
      name,
      pos:
        results!.reduce((acc, log) => +log[name][POSITION_KEY] + acc, 0) /
        results!.length,
    }))
    .sort((a, b) => a.pos - b.pos)
    .forEach(({ name, pos }) => console.log(pos, name))

  process.exit()
})()
