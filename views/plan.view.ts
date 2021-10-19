import express from "express"
import { PlanEntry, PlanGroup } from "../plan"

const mapEntries = (entries: Array<PlanEntry>) => entries.map(r => `<tr>
    <td>${r.code}</td>
    <td>${r.name}</td>
    <td>${r.weight || "-"}</td>
</tr>`).join("\n")

const mapGroups = (groups: Array<PlanGroup>) => groups.map(g => `
    <h2>${g.name}</h2>
    <table>
        <thead>
            <tr>
                <th>code</th>
                <th>name</th>
                <th>weight</th>
            </tr>
        </thead>
        <tbody>
            ${mapEntries(g.entries)}
        </tbody>
    </table>`).join("\n")

const map = (groups: Array<PlanGroup>) => `<!DOCTYPE html>
<html>
<head>
    <title>plan</title>
</head>
<body>
    <h1>plan</h1>
    ${mapGroups(groups)}
</body>
</html>`

export const format = (c: Array<PlanGroup>) => (res: express.Response) => {
    return res.format({
        'application/json': () => res.status(200).json(c),
        'text/html': () => res.status(200).send(map(c)),
        default: () => res.status(406).send()
    })
}
