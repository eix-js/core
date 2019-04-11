export type componentName = string
export type ComponentMap = Map<number,number[]>

export interface Component<T = any> {
    id: number
    data: T
    name: componentName
}
export interface ComponentRouter extends Component{
    [key:string]:any
}
export type UnfoldedComponent = {
    [key:string]:Component
}
export type TrackResults = {
    [key:string]:ComponentRouter
}[]