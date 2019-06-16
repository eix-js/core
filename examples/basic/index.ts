import { Ecs } from '../../src/ecs/ecs'
import { writeFileSync } from 'fs'
import { log } from '../log'

const ecs = new Ecs({
  groupEvents: false
})

ecs.flag('a', 'b')
ecs.flag('b', 'c')
ecs.flag('c', 'a')

ecs.addEntity({
  a: true,
  b: false,
  c: true
})

writeFileSync(`${__dirname}/ecs.json`, log(ecs))
