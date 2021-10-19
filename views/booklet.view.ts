import express from "express"
import moment from "moment"
import { BookletEntry, BookletEntryList } from "../booklet"

const mapRecords = (c: Array<BookletEntry>) => {
    return c.map(r => {
        return `<tr>
    <td>${r.code}</td>
    <td>${r.name}</td>
    <td>${r.year || "-"}</td>
    <td>${r.weight}</td>
    <td>${r.academicYear || "-"}</td>
    <td>${r.date ? moment(r.date).format('MM/DD/YYYY') || "-" : "-"}</td>
    <td>${r.score || "-"}</td>
</tr>`
    }).join("\n")
}

const mapList = (list: BookletEntryList) => `<!DOCTYPE html>
<html>
    <head>
        <title>booklet</title>
    </head>
    <body>
        <h1>booklet</h1>
        <table>
            <thead>
                <tr>
                    <th>code</th>
                    <th>name</th>
                    <th>year</th>
                    <th>weight</th>
                    <th>academic year</th>
                    <th>date</th>
                    <th>score</th>
                </tr>
            </thead>
            <tbody>
                ${mapRecords(list.records)}
            </tbody>
        </table>
    </body>
</html>`

export const format = (c: BookletEntryList) => (res: express.Response) => {
    return res.format({
        'application/json': () => res.status(200).json(c),
        'text/html': () => res.status(200).send(mapList(c)),
        default: () => res.status(406).send()
    })
}
