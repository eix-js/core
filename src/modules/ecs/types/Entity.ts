export interface TypedEntity<T> {
    id: number
    components: T
}

export type UnTypedComponents = Record<string, unknown>

/**
 * @description The base interface for entities used by the ecs class
 */
export type Entity = TypedEntity<UnTypedComponents>
