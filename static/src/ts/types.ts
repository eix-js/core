export interface Contributor {
    name: string
    avatar: string
    github: string
}

export interface Project {
    name: string
    contributors: Contributor[]
    thumbail: string
    github: string
}
