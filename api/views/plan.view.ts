import EX from 'express'
import { PlanEntry, PlanGroupList } from "../net/plan"

const mapEntries = (entries: Array<PlanEntry>): string => entries.map(r => `<tr>
    <td>${r.code}</td>
    <td>${r.name}</td>
    <td>${r.weight || "-"}</td>
</tr>`).join("\n")

const mapGroups = (groups: PlanGroupList): string => (groups.entries || []).map(g => `
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
            ${mapEntries(g.planEntries)}
        </tbody>
    </table>`).join("\n")

const map = (groups: PlanGroupList): string => `<!DOCTYPE html>
<html>
<head>
    <title>plan</title>
</head>
<body>
    <h1>plan</h1>
    ${mapGroups(groups)}
</body>
</html>`

export const format = (c: PlanGroupList) => (res: EX.Response): EX.Response => res.format({
    'application/json': () => res.status(200).json(c),
    'text/html': () => res.status(200).send(map(c)),
    default: () => res.status(406).send()
})
