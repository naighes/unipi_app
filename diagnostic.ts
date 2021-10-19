import { HTMLElement } from 'node-html-parser'

const ensureQuerySelectorAll = (useCase: string) => (element: HTMLElement | undefined) => (selector: string) => {
    const result = element?.querySelectorAll(selector) || []
    if (result.length === 0) {
        console.log(`[WARN] [${useCase}] expected elements for selector ${selector}`)
    }
    return result
}

const ensureGetElementsByTagName = (useCase: string) => (element: HTMLElement | undefined) => (tagName: string) => {
    const result = element?.getElementsByTagName(tagName) || []
    if (result.length === 0) {
        console.log(`[WARN] [${useCase}] expected elements for tag ${tagName}`)
    }
    return result
}

export { ensureQuerySelectorAll, ensureGetElementsByTagName }
