import { performance } from 'perf_hooks'
// TODO move to test source
import type { Source as WSource } from 'wonka'

import { Rec, formatLog, printLogs } from './utils'

type UpdateLeaf = (value: number) => void

type Setup = (hooks: {
  listener: (computedValue: number) => void
  startCreation: () => void
  endCreation: () => void
}) => Promise<UpdateLeaf>

// There is a few tests skipped
// coz I don't know how to turn off their batching
// which delays computations

const testComputers = setupComputersTest({
  async 'skip cellx'({ listener, startCreation, endCreation }) {
    const { cellx } = await import('cellx')

    startCreation()

    const entry = cellx(0)
    const a = cellx(() => entry())
    const b = cellx(() => a() + 1)
    const c = cellx(() => a() + 1)
    const d = cellx(() => b() + c())
    const e = cellx(() => d() + 1)
    const f = cellx(() => d() + e())
    const g = cellx(() => d() + e())
    const h = cellx(() => f() + g())

    listener(h())

    endCreation()

    return (i) => {
      entry(i)
      // this is wrong
      // manual pull could help to skip a computations
      // needed to notification walk
      listener(h())
    }
  },
  async effector({ listener, startCreation, endCreation }) {
    const { createEvent, createStore, combine } = await import('effector')

    startCreation()

    const entry = createEvent<number>()
    const a = createStore(0).on(entry, (state, v) => v)
    const b = a.map((a) => a + 1)
    const c = a.map((a) => a + 1)
    const d = combine(b, c, (b, c) => b + c)
    const e = d.map((d) => d + 1)
    const f = combine(d, e, (d, e) => d + e)
    const g = combine(d, e, (d, e) => d + e)
    const h = combine(f, g, (h1, h2) => h1 + h2)

    h.subscribe(listener)

    endCreation()

    return (i) => entry(i)
  },
  async 'effector (fork)'({ listener, startCreation, endCreation }) {
    const { createEvent, createStore, combine, allSettled, fork } =
      await import('effector')

    startCreation()

    const entry = createEvent<number>()
    const a = createStore(0).on(entry, (state, v) => v)
    const b = a.map((a) => a + 1)
    const c = a.map((a) => a + 1)
    const d = combine(b, c, (b, c) => b + c)
    const e = d.map((d) => d + 1)
    const f = combine(d, e, (d, e) => d + e)
    const g = combine(d, e, (d, e) => d + e)
    const h = combine(f, g, (h1, h2) => h1 + h2)

    const scope = fork()

    endCreation()

    return (i) => {
      allSettled(entry, { scope, params: i })
      // this is not wrong
      // coz effector graph a hot always
      // and `getState` is doing nothing here
      // only internal state reading
      listener(scope.getState(h))
    }
  },
  async 'skip frpts'({ listener, startCreation, endCreation }) {
    const { newAtom, combine } = await import('@frp-ts/core')

    startCreation()

    const entry = newAtom(0)
    const a = combine(entry, (v) => v)
    const b = combine(a, (a) => a + 1)
    const c = combine(a, (a) => a + 1)
    const d = combine(b, c, (b, c) => b + c)
    const e = combine(d, (d) => d + 1)
    const f = combine(d, e, (d, e) => d + e)
    const g = combine(d, e, (d, e) => d + e)
    const h = combine(f, g, (f, g) => f + g)

    listener(h.get())

    endCreation()

    return (i) => {
      entry.set(i)
      // this is wrong
      // manual pull could help to skip a computations
      // needed to notification walk
      listener(h.get())
    }
  },
  async mobx({ listener, startCreation, endCreation }) {
    const { makeAutoObservable, autorun, configure } = await import('mobx')

    configure({ enforceActions: 'never' })

    startCreation()

    const proxy = makeAutoObservable({
      entry: 0,
      get a() {
        return this.entry
      },
      get b() {
        return this.a + 1
      },
      get c() {
        return this.a + 1
      },
      get d() {
        return this.b + this.c
      },
      get e() {
        return this.d + 1
      },
      get f() {
        return this.d + this.e
      },
      get g() {
        return this.d + this.e
      },
      get h() {
        return this.f + this.g
      },
    })

    autorun(() => listener(proxy.h))

    endCreation()

    return (i) => (proxy.entry = i)
  },
  async 'skip mol'({ listener, startCreation, endCreation }) {
    const mol_wire_lib = await import('mol_wire_lib')
    const { $mol_wire_atom } = mol_wire_lib

    startCreation()

    const entry = new $mol_wire_atom('entry', (next: number = 0) => next)
    const a = new $mol_wire_atom('mA', () => entry.sync())
    const b = new $mol_wire_atom('mB', () => a.sync() + 1)
    const c = new $mol_wire_atom('mC', () => a.sync() + 1)
    const d = new $mol_wire_atom('mD', () => b.sync() + c.sync())
    const e = new $mol_wire_atom('mE', () => d.sync() + 1)
    const f = new $mol_wire_atom('mF', () => d.sync() + e.sync())
    const g = new $mol_wire_atom('mG', () => d.sync() + e.sync())
    const h = new $mol_wire_atom('mH', () => f.sync() + g.sync())

    listener(h.sync())

    endCreation()

    return (i) => {
      entry.put(i)
      // this is wrong
      // manual pull could help to skip a computations
      // needed to notification walk
      listener(h.sync())
    }
  },
  async preact({ listener, startCreation, endCreation }) {
    const { signal, computed, effect } = await import('@preact/signals-core')

    startCreation()

    const entry = signal(0)
    const a = computed(() => entry.value)
    const b = computed(() => a.value + 1)
    const c = computed(() => a.value + 1)
    const d = computed(() => b.value + c.value)
    const e = computed(() => d.value + 1)
    const f = computed(() => d.value + e.value)
    const g = computed(() => d.value + e.value)
    const h = computed(() => f.value + g.value)

    effect(() => listener(h.value))

    endCreation()

    return (i) => (entry.value = i)
  },
  async reatom({ listener, startCreation, endCreation }) {
    const { atom, createCtx } = await import('@reatom/core')

    startCreation()

    const a = atom(0)
    const b = atom((ctx) => ctx.spy(a) + 1)
    const c = atom((ctx) => ctx.spy(a) + 1)
    const d = atom((ctx) => ctx.spy(b) + ctx.spy(c))
    const e = atom((ctx) => ctx.spy(d) + 1)
    const f = atom((ctx) => ctx.spy(d) + ctx.spy(e))
    const g = atom((ctx) => ctx.spy(d) + ctx.spy(e))
    const h = atom((ctx) => ctx.spy(f) + ctx.spy(g))

    const ctx = createCtx()
    ctx.subscribe(h, listener)

    endCreation()

    return (i) => a(ctx, i)
  },
  async solid({ listener, startCreation, endCreation }) {
    const { createSignal, createMemo, createEffect } = await import(
      // FIXME
      // @ts-ignore
      'solid-js/dist/solid.cjs'
    )

    startCreation()

    const [entry, update] = createSignal(0)
    const a = createMemo(() => entry())
    const b = createMemo(() => a() + 1)
    const c = createMemo(() => a() + 1)
    const d = createMemo(() => b() + c())
    const e = createMemo(() => d() + 1)
    const f = createMemo(() => d() + e())
    const g = createMemo(() => d() + e())
    const h = createMemo(() => f() + g())

    createEffect(() => listener(h()))

    endCreation()

    return (i) => update(i)
  },
  async 's.js'({ listener, startCreation, endCreation }) {
    const { default: S } = await import('s-js')

    startCreation()

    const entry = S.root(() => {
      const entry = S.data(0)
      const a = S(() => entry())
      const b = S(() => a() + 1)
      const c = S(() => a() + 1)
      const d = S(() => b() + c())
      const e = S(() => d() + 1)
      const f = S(() => d() + e())
      const g = S(() => d() + e())
      const h = S(() => f() + g())

      S(() => listener(h()))

      return entry
    })

    endCreation()

    return (i) => entry(i)
  },
  async usignal({ listener, startCreation, endCreation }) {
    const { signal, computed, effect } = await import('usignal')

    startCreation()

    const entry = signal(0)
    const a = computed(() => entry.value)
    const b = computed(() => a.value + 1)
    const c = computed(() => a.value + 1)
    const d = computed(() => b.value + c.value)
    const e = computed(() => d.value + 1)
    const f = computed(() => d.value + e.value)
    const g = computed(() => d.value + e.value)
    const h = computed(() => f.value + g.value)

    effect(() => listener(h.value))

    endCreation()

    return (i) => (entry.value = i)
  },
  async wonka({ listener, startCreation, endCreation }) {
    const { makeSubject, pipe, map, subscribe, combine, sample } = await import(
      'wonka'
    )

    const ccombine = <A, B>(
      sourceA: WSource<A>,
      sourceB: WSource<B>,
    ): WSource<[A, B]> => {
      const source = combine(sourceA, sourceB)
      // return source
      return pipe(source, sample(source))
    }

    startCreation()

    const entry = makeSubject<number>()
    const a = pipe(
      entry.source,
      map((v) => v),
    )
    const b = pipe(
      a,
      map((v) => v + 1),
    )
    const c = pipe(
      a,
      map((v) => v + 1),
    )
    const d = pipe(
      ccombine(b, c),
      map(([b, c]) => b + c),
    )
    const e = pipe(
      d,
      map((v) => v + 1),
    )
    const f = pipe(
      ccombine(d, e),
      map(([d, e]) => d + e),
    )
    const g = pipe(
      ccombine(d, e),
      map(([d, e]) => d + e),
    )
    const h = pipe(
      ccombine(f, g),
      map(([h1, h2]) => h1 + h2),
    )
    pipe(h, subscribe(listener))

    endCreation()

    return (i) => entry.next(i)
  },
})

function setupComputersTest(tests: Rec<Setup>) {
  return async (iterations: number) => {
    const creationTries = 5
    const testsList: Array<{
      ref: { value: number }
      update: UpdateLeaf
      name: string
      creationLogs: Array<number>
      updateLogs: Array<number>
    }> = []

    for (const name in tests) {
      if (name.startsWith('skip')) continue

      const ref = { value: 0 }
      const creationLogs: Array<number> = []
      let update: UpdateLeaf
      let start = 0
      let end = 0
      let i = creationTries

      while (i--) {
        update = await tests[name]!({
          listener: (value) => (ref.value = value),
          startCreation: () => (start = performance.now()),
          endCreation: () => (end = performance.now()),
        })

        creationLogs.push(end - start)

        // try to prevent optimization of code meaning throwing
        update(-1)
      }

      testsList.push({
        ref,
        update: update!,
        name,
        creationLogs,
        updateLogs: [],
      })
    }

    console.log(
      `Median of computers creation and linking from ${creationTries} iterations\n(UNSTABLE)`,
    )

    printLogs(
      testsList.reduce(
        (acc, { name, creationLogs }) => (
          (acc[name] = formatLog(creationLogs)), acc
        ),
        {} as Rec<any>,
      ),
    )

    let i = 0
    while (i++ < iterations) {
      for (const test of testsList) {
        const start = performance.now()
        test.update(i)
        test.updateLogs.push(performance.now() - start)
      }

      if (new Set(testsList.map((test) => test.ref.value)).size !== 1) {
        console.log(`ERROR!`)
        console.error(`Results is not equal (iteration №${i})`)
        console.log(
          testsList.reduce(
            (acc, test) => ((acc[test.name] = test.ref.value), acc),
            {} as Rec<number>,
          ),
        )
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    console.log(`Median on one call in ms from ${iterations} iterations`)

    printLogs(
      testsList.reduce(
        (acc, { name, updateLogs }) => (
          (acc[name] = formatLog(updateLogs)), acc
        ),
        {} as Rec<any>,
      ),
    )
  }
}

test()
async function test() {
  await Promise.all([
    testComputers(10),
    testComputers(100),
    testComputers(1_000),
    testComputers(10_000),
  ])

  process.exit()
}
