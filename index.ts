// import BenchWorker from './computers_bench?worker'
// const worker = new BenchWorker()

import { test } from './computers_bench'

const { table } = console
console.table = function (data) {
  const pre = document.createElement('pre')
  pre.innerHTML = JSON.stringify(data, null, 2)
  document.body.appendChild(pre)
  table.call(this, data)
}

test()
