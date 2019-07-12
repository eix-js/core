[![Build Status](https://img.shields.io/travis/eix-js/core.svg)](https://travis-ci.com/eix-js/core) [![License](https://img.shields.io/github/license/eix-js/core.svg)](https://github.com/eix-js/core/blob/master/LICENSE.md) [![Version](https://img.shields.io/github/package-json/v/eix-js/core.svg)](https://github.com/eix-js/core) [![Minzipped size size](https://badgen.net/bundlephobia/minzip/@eix-js/core)](https://bundlephobia.com/result?p=@eix-js/core@latest)

# Eix-core
the core of the eix game engine

# Getting started 
To get started, you need to have npm and node installed on your machine, and then install @eix/core and ts-node with:
```
npm i @eix/core ts-node
```

Create an `index.ts` file, and import the library:
```ts
import { Ecs } from '@eix/core'
``` 

Ecs is the main class exposed by this engine:
```ts
const ecs = new Ecs()

ecs.addEntity({
    prop: true
})

ecs
    .flag('prop')
    .get<{prop:boolean}>()
    .each({prop} => console.log(prop)) // true
```

# Playing around with the source:
First, clone this repo:
```sh
git clone "https://github.com/eix-js/core"
```

Then install the dependencies:
```sh
npm install
```

You can use `npm test` to run all tests and `npm run docs` to generate docs. 
