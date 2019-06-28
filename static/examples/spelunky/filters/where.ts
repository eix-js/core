import { EcsGraph, EntityFilterInitter } from '@eix/core'

export type operator = '==' | '!='

export const where = <T>(
    componentName: string,
    operator: operator,
    value: T
): [EntityFilterInitter, string] => [
    {
        name: (componentName: string) =>
            `where ${componentName} ${operator} ${value}`,
        test: (
            ecs: EcsGraph,
            componentName: string
        ): ((id: number) => boolean) => (id: number): boolean => {
            if (operator === '==') {
                return ecs.entities[id].components[componentName] === value
            } else if (operator === '!=') {
                return ecs.entities[id].components[componentName] !== value
            } else {
                return true
            }
        }
    },
    componentName
]
