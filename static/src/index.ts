import './styles.scss'
import { displayProjects } from './ts/projectDisplayer'
// import '../examples/movement'
import { main } from '../examples/spelunky'

displayProjects()
// showExample()
const canvas = document.getElementById('canvas') as HTMLCanvasElement

canvas.height = window.innerHeight
canvas.width = window.innerWidth

main(canvas)
