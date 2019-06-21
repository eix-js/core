import { render, html, TemplateResult } from 'lit-html'
import { projects } from './projects'
import { Project, Contributor } from './types'

export const contributor = (contributor: Contributor): TemplateResult => html`
    <div class="contributor">
        <img src=${contributor.avatar} alt=${contributor.name} height="100%" />
    </div>
`

export const displayProjects = () => {
    render(
        html`
            ${projects.map(
                (project: Project): TemplateResult => html`
                    <a href=${project.github}>
                        <div class="project">
                            <div
                                class="project-name"
                                style="background-image: url('${project.thumbail}')"
                            >
                                <span>
                                    ${project.name}
                                </span>
                            </div>
                        </div>
                    </a>
                `
            )}
        `,
        document.querySelector('#projectCards') as HTMLDivElement
    )
}
