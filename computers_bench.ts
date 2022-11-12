// TODO move to test source
import type { Source as WSource } from 'wonka'
import { genChart } from './chart_gen'

import { Rec, formatLog, printLogs, getComplexity } from './utils'

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
  // async native({ listener, startCreation, endCreation }) {
  //   startCreation()

  //   const entry = (i = 0) => i
  //   const a = (i: number) => entry(i)
  //   const b = (i: number) => a(i) + 1
  //   const c = (i: number) => a(i) + 1
  //   const d = (i: number) => b(i) + c(i)
  //   const e = (i: number) => d(i) + 1
  //   const f = (i: number) => d(i) + e(i)
  //   const g = (i: number) => d(i) + e(i)
  //   const h = (i: number) => f(i) + g(i)

  //   endCreation()

  //   return (i) => listener(h(i))
  // },
  // async selector({ listener, startCreation, endCreation }) {
  //   const createSelector = (cb: (input: any) => any) => {
  //     let input: any, res: any
  //     return (i: any) => (i === input ? res : (res = cb((input = i))))
  //   }
  //   startCreation()

  //   const entry = createSelector((i = 0) => i)
  //   const a = createSelector((i: number) => entry(i))
  //   const b = createSelector((i: number) => a(i) + 1)
  //   const c = createSelector((i: number) => a(i) + 1)
  //   const d = createSelector((i: number) => b(i) + c(i))
  //   const e = createSelector((i: number) => d(i) + 1)
  //   const f = createSelector((i: number) => d(i) + e(i))
  //   const g = createSelector((i: number) => d(i) + e(i))
  //   const h = createSelector((i: number) => f(i) + g(i))

  //   endCreation()

  //   return (i) => listener(h(i))
  // },
  async spred({ listener, startCreation, endCreation }) {
    const { writable, computed } = await import('spred')

    startCreation()

    const entry = writable(0)
    const a = computed(() => entry())
    const b = computed(() => a() + 1)
    const c = computed(() => a() + 1)
    const d = computed(() => b() + c())
    const e = computed(() => d() + 1)
    const f = computed(() => d() + e())
    const g = computed(() => d() + e())
    const h = computed(() => f() + g())

    h.subscribe(listener)

    endCreation()

    return (i) => entry(i)
  },
  async cellx({ listener, startCreation, endCreation }) {
    const { cellx, Cell } = await import('cellx')

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

    h.subscribe((err, v) => listener(h()))

    endCreation()

    return (i) => {
      entry(i)
      Cell.release()
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
  async frpts({ listener, startCreation, endCreation }) {
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

    h.subscribe({ next: () => listener(h.get()) })

    endCreation()

    return (i) => entry.set(i)
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
  async $mol_wire_atom({ listener, startCreation, endCreation }) {
    const mol_wire_lib = await import('mol_wire_lib')
    const { $mol_wire_atom } = mol_wire_lib.default

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
      // the batch doing the same https://github.com/hyoo-ru/mam_mol/blob/c9cf0faf966c8bb3d0e76339527ef03e03d273e8/wire/fiber/fiber.ts#L31
      listener(h.sync())
    }
  },
  // async $mol_wire_solo({ listener, startCreation, endCreation }) {
  //   const mol_wire_lib = await import('mol_wire_lib')
  //   const { $mol_wire_solo: mem } = mol_wire_lib.default

  //   startCreation()

  //   class App extends Object {
  //     @mem static entry(next = 0) { return next }
  //     @mem static a() { return this.entry() }
  //     @mem static b() { return this.a() + 1 }
  //     @mem static c() { return this.a() + 1 }
  //     @mem static d() { return this.b() + this.c() }
  //     @mem static e() { return this.d() + 1 }
  //     @mem static f() { return this.d() + this.e() }
  //     @mem static g() { return this.d() + this.e() }
  //     @mem static h() { return this.f() + this.g() }
  //   }

  //   listener(App.h())

  //   endCreation()

  //   return (i) => {
  //     App.entry(i)
  //     // the batch doing the same https://github.com/hyoo-ru/mam_mol/blob/c9cf0faf966c8bb3d0e76339527ef03e03d273e8/wire/fiber/fiber.ts#L31
  //     listener(App.h())
  //   }
  // },
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
    const { action, atom, createCtx } = await import('@reatom/core')

    startCreation()

    const entry = action<number>()
    const a = atom((ctx, state = 0) => {
      ctx.spy(entry).forEach((v) => (state = v.payload))
      return state
    })
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

    return (i) => entry(ctx, i)
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
  async whatsup({ listener, startCreation, endCreation }) {
    const { observable, computed, autorun } = await import('whatsup')

    startCreation()

    const entry = observable(0)
    const a = computed(() => entry())
    const b = computed(() => a() + 1)
    const c = computed(() => a() + 1)
    const d = computed(() => b() + c())
    const e = computed(() => d() + 1)
    const f = computed(() => d() + e())
    const g = computed(() => d() + e())
    const h = computed(() => f() + g())

    autorun(() => listener(h()))

    endCreation()

    return (i) => entry(i)
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
  return async (iterations: number, creationTries: number) => {
    const testsList: Array<{
      ref: { value: number }
      update: UpdateLeaf
      name: string
      creationLogs: Array<number>
      updateLogs: Array<number>
      memLogs: Array<number>
      complexity: number
    }> = []

    for (const name in tests) {
      await new Promise((resolve) => setTimeout(resolve, 0)) // wait idle

      const ref = { value: 0 }
      const creationLogs: Array<number> = []
      let update: UpdateLeaf
      let start = 0
      let end = 0
      let i = creationTries || 1

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
        memLogs: [],
        complexity: getComplexity( tests[name] ),
      })
      
    }

    if (creationTries > 0) {
      console.log(
        `Median of computers creation and linking from ${creationTries} iterations\n(UNSTABLE)`,
      )

      printLogs(
        Object.fromEntries(
          testsList.map(({ name, creationLogs, complexity }) => [
            name,
            formatLog(creationLogs, complexity),
          ]),
        ),
      )
    }

    let i = 0
    while (i++ < iterations) {
      await new Promise((resolve) => setTimeout(resolve, 0)) // wait idle
      
      testsList.sort( ()=> Math.random() - .5 )
      
      for (const test of testsList) {
        globalThis.gc?.()
        globalThis.gc?.()
        let mem = globalThis.process?.memoryUsage?.().heapUsed

        const start = performance.now()
        test.update(i % 2)
        test.updateLogs.push(performance.now() - start)

        if (mem) test.memLogs.push(process.memoryUsage().heapUsed - mem)
      }

      if (new Set(testsList.map((test) => test.ref.value)).size !== 1) {
        console.log(`ERROR!`)
        console.error(`Results is not equal (iteration №${i})`)
        console.log(
          Object.fromEntries(
            testsList.map(({ name, ref }) => [name, ref.value]),
          ),
        )
        return
      }
    }

    console.log(`Median of update duration from ${iterations} iterations`)

    const results = testsList.reduce(
      (acc, { name, updateLogs, complexity }) => ((acc[name] = formatLog(updateLogs, complexity)), acc),
      {} as Rec<any>,
    )

    printLogs(results)

    if (globalThis.gc) {
      console.log(`Median of "heapUsed" from ${iterations} iterations`)
      printLogs(
        testsList.reduce(
          (acc, { name, memLogs, complexity }) => ((acc[name] = formatLog(memLogs, complexity)), acc),
          {} as Rec<any>,
        ),
      )
    }

    return results
  }
}

export async function test() {
  const results = {
    10: await testComputers(10, 5),
    100: await testComputers(100, 0),
    1_000: await testComputers(1_000, 0),
    10_000: await testComputers(10_000, 0),
  }

  await genChart(results)
}

if (globalThis.process) {
  import('perf_hooks')
    // @ts-expect-error
    .then(({ performance }) => (globalThis.performance = performance))
    .then((): any => (globalThis.gc ? testComputers(300, 0) : test()))
    .then(() => process.exit())
}
