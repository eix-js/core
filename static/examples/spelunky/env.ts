export const enviroment = {
    physics: {
        gravity: 0.001
    },
    screenSize: [0, 0]
}

export const resize = () => {
    enviroment.screenSize = [window.innerWidth, window.innerHeight << 1]
}

resize()
