import { expect } from "chai"
import { Task } from "../src/jobSystem/task"
import { random } from "./utils/random.util";

describe("Task", () => {
    it("should allow adding jobs", () => {
        //create a task
        const test = new Task<[], []>([])

        //generate random number
        const num = random(10, 100)

        //add random jobs
        for (let i = 0; i < num; i++)
            test.addJob(`${i}`, () => () => { })

        //compare length with how many tasks we added
        const result = Object.keys(test.jobs).length

        expect(result, "the task should have the same number of jobs as the random number")
            .to.be.equal(num)
    })

    it("should allow passing a state when adding jobs", () => {
        //create a task
        const test = new Task<[], []>([])

        //add a job
        test.addJob("testJob", () => () => { }, false)

        //job should be disabled
        const result = test.jobs.testJob.enabled

        expect(result, "job should be disabled after passing false as the 3rd argument of addJob")
            .to.be.false
    })

    it("should pass the correct arguments to jobs", () => {
        //generate random number
        const num = random(10, 100)

        //create a task
        const test = new Task<[number], []>([num])

        //add a job
        test.addJob("testJob", ([arg]) => {
            //the arg should be what we passed to the constructor
            expect(arg, "the argument passed to the factory function should equal the one passed to the task")
                .to.be.equal(num)

            //return something to make ts shut up
            return () => { }
        })
    })

    it("should allow manipulating the state of jobs", () => {
        //create a task
        const test = new Task<[], []>([])

        //generate random state ( and cast it to a boolean for ts to shut up )
        const randomState = !!(random(0, 1) % 2)

        //add a job
        test.addJob("testJob", () => () => { }, randomState)

        //toggle state and save result
        const result = test.toggle("testJob").jobs.testJob.enabled

        //compare it to randomState
        expect(result, "after calling togle the state of the job must be toggled")
            .to.be.equal(!randomState)
            .to.not.be.equal(randomState)

        //call enable and save the result
        const secondResult = test.enable("testJob").jobs.testJob.enabled

        //secondResult should be true
        expect(secondResult, "after calling .enable the job should be enabled")
            .to.be.true

        //call enable and save the result
        const thirdResult = test.disable("testJob").jobs.testJob.enabled

        //secondResult should be true
        expect(thirdResult, "after calling .disable the job shouldnt be enabled")
            .to.be.false
    })

    it("should call jobs with the correct arguments", () => {
        //create task
        const test = new Task<[], [number]>([])

        //generate a random number of times
        const times = random(20, 200)

        //generate initial random number
        let num = random(10, 100)

        //add job
        test.addJob("testJob", () => ([arg]) => {
            expect(arg).to.be.equal(num)
        })

        //test <times> times
        for (let i = 0; i < times; i++) {
            //update num
            num = random(10, 100)

            //run jobs
            test.runJobs([num])
        }
    })

    it("should only call enabled jobs", () => {
        //create task
        const test = new Task<[], []>([])

        //generate a random array of states ( and cast everything to booleans for ts to shut up )
        const states = [...Array(random(50, 200))] //empty array of random sixe between 50 and 200
            .map(_ => !!(random(0, 2) % 2)) //fill array with random states

        //count how many jobs were called
        let count = 0

        //add jobs:
        //iterate over states
        states.forEach((state, index) =>
            //add new job
            test.addJob(`${index}`, () => () => {
                count++ //increment count
            }, state) //this state is random
        )

        //call all jobs
        test.runJobs([])

        //the number of jobs called should be equal to the number of true states
        //count how many states are true
        const trueStates = states.filter(val => val).length

        //compare trueStates with the count
        expect(count, "the number of jobs called should be equal to the number of true states")
            .to.be.equal(trueStates)
    })
})




