export type Job<jobArgs> = (args: jobArgs) => any
export type JobFactory<factoryArgs, jobArgs> = (args: factoryArgs) => Job<jobArgs>

export interface JobConfig {
    [key: string]: {
        activation: Job<any>
        enabled: boolean
    }
}