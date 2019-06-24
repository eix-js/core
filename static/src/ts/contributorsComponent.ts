import { html } from 'lit-html'
import { component } from 'haunted'
import { contributors } from './data/contributors'

export const contributorsComponent = component(
    () =>
        html`
            <div id="description">
                This project wouldn't have been possible without the
                contribution of the following people:
            </div>
            <div id="list">
                ${Object.values(contributors).map(
                    contributor => html`
                        <a href=${contributor.github}>
                            <div class="contributor">
                                <div class="avatar">
                                    <img
                                        alt=${contributor.name}
                                        src=${contributor.avatar}
                                        height="30px"
                                    />
                                </div></div
                        ></a>
                    `
                )}
            </div>
        `,
    HTMLElement,
    { useShadowDOM: false }
)
