# eix-core
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
...
const ecs = new Ecs(false) // async mode is true by default, and even if its faster, it can be pretty counter-intuitive for begginers
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

You can use `npm test' to run all tests and `npm docs to generate docs`. 