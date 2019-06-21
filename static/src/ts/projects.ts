import { Project } from './types'
import { contributors } from './contributors'

declare function require<T>(url: string): T

export const projects: Project[] = [
    {
        name: 'core',
        contributors: [contributors.Adriel],
        thumbail: require<string>('../assets/eix.png'),
        github: 'https://github.com/eix-js/core'
    },
    {
        name: 'utils',
        contributors: [contributors.Adriel],
        thumbail: require<string>('../assets/moon.png'),
        github: 'https://github.com/eix-js/utils'
    },
    {
        name: 'input',
        contributors: [contributors.Neverix],
        thumbail: require<string>('../assets/keyboard.png'),
        github: 'https://github.com/eix-js/input'
    }
]
