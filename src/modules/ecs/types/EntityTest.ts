import { Dependency } from './Dependency'
import { LruCache } from '@eix-js/utils'

export type EntityTest = (id: number) => boolean

/**
 * @description Basic interface for filters
 */
export interface EntityFilter {
    hash: number
    test: EntityTest
    cache: LruCache<boolean>
}

export interface EntityFilterInitter {
    dependencies: Dependency
    key: string
    test: (id: number) => boolean
}
