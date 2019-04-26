# eix-core
the core of the eix game engine

# Getting started 
To get started, first install @eix/ui with
```
npm i <the url of this repo>
```

TODO: write docs for ecs (till then, see the last example bellow)

# The job system

To start, create a job system:
```ts
import { JobSystem } from "@eix/core"

const system = new JobSystem()
```

The job system is a singleton (see @eix/utils), so behind the scenes it only servers you one instance.

A job is just a factory function (in this example we use lit-html, but you can use whatever ou want):
```ts
import { html, render } from "lit-html"

const greetingJob = ([greetingFormula]) => {
    //prefix for the greeting, only created once
    const formula = html`<span style="color:red">
        ${greetingForumla}
    </span>`

    //then we need to return the job
    return ([user]) => {
        //create full greeting
        const greeting = html`<h1>
            ${formula} ${user.name} !
        </h1>`

        //do something with it
        render(greeting, document.body)
    } 
}
```

>___TIP___: arguments must stay inside an array for typescript to detect the types from tasks


Usually, you'll want to call more things at once, so let's create a task:
```ts
system.addTask<
    [string], //the types for the arguments passed to the factory function
    [{ name:string }] //the types for the arguments passed to the actual returned job
>(
    "myTask", //the name of the task
    ["Hello"] //aguments to pass to the factory functions by default
)
```

after that, you need to add the jobs to the task:
```ts
system.tasks.myTask.addJob(
    "greetingJob", // the name of the job
    greetingJob // the function we created earlier
)
```

Finally, you can call your task:
```ts
system.tasks.myTask.runJobs([{ //the arguments for all jobs
    name: "Matei Adriel" 
}])
```

## A more advance example:

Here is an example of using the jobSystem with the ecs and mainloop.js:
```ts   
import { ECS, JobSystem } from "@eix/core"
import { Task } from "@eix/core/dist/jobSystem/task";
import { Job } from "@eix/core/dist/jobSystem/interfaces";
import * as mainloop from "mainloop.js"

const system = new JobSystem()
const ecs = new ECS()

ecs.addEntity()
ecs.entities[0].position = [100, 100]
ecs.entities[0].speed = [1, 2]
ecs.entities[0].acceleration = [0, 0]

//create and run task
system.addTask<[ECS], [number]>("update", [ecs])

const task: Task<[ECS], [number]> = system.tasks.update

task
    //this job adds the speed to the position
    .addJob("speedJob", ([env]) => {
        //query components
        const components = env.all
            .has("speed")
            .get("position", "speed")

        //return a job
        return ([delta]) =>
            components.tracked.forEach(({ position, speed }: any) => {
                //increase position
                position[0] += speed[0] * delta
                position[1] += speed[1] * delta
            })
    })

    //this jobs adds the acceleration to the speed
    .addJob("accelerationJob", ([env]) => {
        //query components
        const components = env.all
            .has("acceleration")
            .get("acceleration", "speed")

        // let time = 1/000

        //return a job
        return ([delta]) =>
            components.tracked.forEach(({ acceleration, speed }: any) => {
                //increase speed
                speed[0] += acceleration[0] * delta
                speed[1] += acceleration[1] * delta
            })
    })

    //this job just logs the position
    .addJob("logger", ([env]) => {
        const components = env.all.get("position")

        let time = 0

        return ([delta]) => {
            components.tracked.forEach(({ position }): any => {
                //only log if once every 60 frames
                if (++time % 60 != 0)
                    return

                console.log(position)
            })
        }
    })

mainloop.setUpdate((delta: number) => task.runJobs([delta / 1000])).setMaxAllowedFPS(2).start()
```

# Playing with the source:
Run `npm test` to run test and `npm run buil` to build.







