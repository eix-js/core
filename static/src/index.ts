import './styles.scss'
import { projectsComponent } from './ts/projectComponent'
import { contributorsComponent } from './ts/contributorsComponent'
import { main } from '../examples/spelunky'
import { enviroment } from '../examples/spelunky/env'

customElements.define('eix-projects', projectsComponent)
customElements.define('eix-contributors', contributorsComponent)

const canvas = document.getElementById('canvas') as HTMLCanvasElement

canvas.height = enviroment.screenSize[1]
canvas.width = enviroment.screenSize[0]

main(canvas)
