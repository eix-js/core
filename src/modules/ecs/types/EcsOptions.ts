/**
 * @description options to be passed to the constructor of the main ecs class
 */
export interface EcsOptions {
    setComponentOnUpdate: boolean
    addComponentsIfTheyDontExist: boolean
    cacheSize: number
    countEvents: boolean
    bulkNodeEventPropagation: boolean
}
