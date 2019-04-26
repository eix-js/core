```ts
//get jobSystem
const jobSystem = new JobSystem()

//add jobChunk
jobSystem.addChunck<
    [App], // tuple with extra arg types
    [number] // tuple with job extra args
>("update")

//create job
const updateTest = (env:ECS, app:App) => {
    const global = "Hello world!"

    return (delta:number) => {
        console.log(`${global} & ${delta}`)
    }
}
const otherJob = ....

//add job to job system
jobSystem.chunks.update.addJob(updateTest,otherJob)

//create args
const ecs = new ECS()
const app = new App()

//init chunk
jobSystem.chunks.update.init(ecs,app)

//call chunk
mainloop.setUpdate(jobSystem.chunks.update.run)
```








