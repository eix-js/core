import { Singleton } from "@eix/utils"
import { Task } from "./task";


class JobSystemUndecorated {

    /**
     * holds all the tasks of the system
     */
    tasks: {
        [key: string]: Task<any, any>
    } = {}

    /**
     * Used to manage jobs for the ecs
     */
    constructor() { }

    /**
     * @param factoryArgs a tuple with all the types of the args of the factory function
     * @param jobArgs a tuple with all the types of the args of the actual job function
     * @param name the name of the new task
     * @param args the arguments to pass to the task
     */
    addTask<factoryArgs, jobArgs>(name: string, args: factoryArgs) {
        //create new task
        this.tasks[name] = new Task<factoryArgs, jobArgs>(args)
    }
}

@Singleton
class JobSystem extends JobSystemUndecorated { }

export { JobSystem, JobSystemUndecorated }