import { html, render } from 'lit-html'

export const showExample = (): void => {
    // console.log(document.querySelector('.contributors'))
    render(
        html`
            <!-- <div> -->
            <iframe
                src="${require('../../examples/movement/dist/index.htmlx')}"
                frameborder="0"
                width="100%"
            ></iframe>
            <!-- </div> -->
        `,
        document.querySelector('.contributors') as HTMLDivElement
    )
}
