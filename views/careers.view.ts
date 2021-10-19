import express from "express"
import { Careers } from "../career_selection"

const mapCareers = (careers: Careers) => Object.keys(careers).reduce<Array<string>>((p, c) => {
    const id = parseInt(c)
    if (!c) {
        return p
    }
    return [
    ...p,
    `<tr>
    <td>${careers[id].studentId}</td>
    <td>${careers[id].name}</td>
    <td>${careers[id].type}</td>
    <td>${careers[id].active ? "active" : "inactive"}</td>
</tr>`]
    }, []).join("\n")


const map = (careers: Careers) => `<!DOCTYPE html>
<html>
<head>
    <title>careers</title>
</head>
<body>
    <h1>careers</h1>
    <table>
        <thead>
            <tr>
                <th>student id</th>
                <th>name</th>
                <th>type</th>
                <th>status</th>
            </tr>
        </thead>
        <tbody>
            ${mapCareers(careers)}
        </tbody>
    </table>
</body>
</html>`

export const format = (c: Careers) => (res: express.Response) => {
    return res.format({
        'text/html': () => res.status(200).send(map(c)),
        'application/json': () => res.status(200).json(c),
        default: () => res.status(406).send()
    })
}
