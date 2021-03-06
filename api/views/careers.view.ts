import EX from 'express'
import { CareerList } from "../net/careers"

const mapCareers = (careers: CareerList): string => (careers.entries || []).map(c => {
    return `<tr>
    <td>${c.registrationNumber}</td>
    <td>${c.careerId}</td>
    <td>${c.name}</td>
    <td>${c.type}</td>
    <td>${c.active ? "active" : "inactive"}</td>
</tr>`
    }).join("\n")


const map = (careers: CareerList): string => `<!DOCTYPE html>
<html>
<head>
    <title>careers</title>
</head>
<body>
    <h1>careers</h1>
    <table>
        <thead>
            <tr>
                <th>registration number</th>
                <th>career id</th>
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

export const format = (c: CareerList) => (res: EX.Response): EX.Response => {
    return res.format({
        'application/json': () => res.status(200).json(c),
        'text/html': () => res.status(200).send(map(c)),
        default: () => res.status(406).send()
    })
}
