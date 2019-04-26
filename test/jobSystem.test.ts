import { JobSystem } from "../src/jobSystem/jobSystem"
import { random } from "./utils/random.util"
import { expect } from "chai"

//reusable code
function resetSystem(system: JobSystem) {
    system.tasks = {}
}

describe("JobSystem", () => {
    it("should allow adding tasks", () => {
        //create a system
        const test = new JobSystem()

        //generate random number
        const num = random(10, 100)

        //add random tasks
        for (let i = 0; i < num; i++)
            test.addTask<[], []>(`${i}`, [])

        //compare length with how many tasks we added
        const result = Object.keys(test.tasks).length

        expect(result, "the job system should have the same number of tasks as the random number")
            .to.be.equal(num)
    })
})




