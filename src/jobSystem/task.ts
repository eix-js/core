import { Job, JobFactory, JobConfig } from "./interfaces";

export class Task<factoryArgs, jobArgs> {

    /**
     * keeps all the jobs of the task
     */
    jobs: JobConfig = {}

    /**
     * Used to group multiple jobs and call them together 
     * @param factoryArgs a tuple with all the types of the args of the factory function
     * @param jobArgs a tuple with all the types of the args of the actual job function
     * @param args the arguments used to create each new job
     */
    constructor(private args: factoryArgs) { }

    /**
     * used to add jobs to the task
     * @name the name of the new job
     * @param job the job to add
     * @param enabled specifies if the job should start as enabled
     * @returns the task itself
     */
    addJob(name: string, job: JobFactory<factoryArgs, jobArgs>, enabled = true) {
        //save job
        this.jobs[name] = {
            activation: job(this.args),
            enabled
        }

        //return the task itself(i wont write this comment everywhere)
        return this
    }

    /**
     * Used to actually call all the active jobs
     * @param args the arguments to pass to all jobs
     * @returns the task itself
     */
    runJobs(args: jobArgs) {
        //iterate over all jobs
        Object.values(this.jobs)
            .filter(value => value.enabled) //filter only enabled jobs
            .map(value => value.activation) //map jobs to functions
            .forEach(value => value(args)) //call the functions

        return this
    }

    /**
     * Used to enable a job by knowing its name
     * @param name the name of the job to enable
     * @returns the task itself
     */
    enable(name: string) {
        if (this.jobs[name])
            this.jobs[name].enabled = true

        return this
    }

    /**
     * Used to disable a job by knowing its name
     * @param name the name of the job to disable
     * @returns the task itself
     */
    disable(name: string) {
        if (this.jobs[name])
            this.jobs[name].enabled = false

        return this
    }

    /**
     * Used to togglee a job by knowing its name
     * @param name the name of the job to toggle the state of
     * @returns the task itself
     */
    toggle(name: string) {
        if (this.jobs[name])
            this.jobs[name].enabled = !this.jobs[name].enabled

        return this
    }
}


