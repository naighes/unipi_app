import express from "express"
import moment from "moment"
import { Course, Call } from "../net/courses"

const mapCalls = (entries: Array<Call>) => entries.map(c => `<tr>
<td>${c.date ? moment(c.date).format('MM/DD/YYYY hh:mm') || "-" : "-"}</td>
<td>${c.location}</td>
<td>${c.type}</td>
<td>${c.openingDates ? moment(c.openingDates).format('MM/DD/YYYY hh:mm') || "-" : "-"}</td>
<td>${c.closingDates ? moment(c.closingDates).format('MM/DD/YYYY hh:mm') || "-" : "-"}</td>
<td>${c.subscriptions}</td>
<td>${c.oldSystem}</td>
<td>${c.notes}</td>
</tr>`).join("\n")

const mapCourses = (courses: Array<Course>) => courses.map(c => {
    return `
    <h2>${c.code} ${c.subject} ${c.academicYear} (${c.weight} credits)</h2>
    <h3>teacher ${c.teacher}</h3>
    <table>
        <thead>
            <tr>
                <th>date</th>
                <th>location</th>
                <th>type</th>
                <th>opening dates</th>
                <th>closing dates</th>
                <th>subscriptions</th>
                <th>old system</th>
                <th>notes</th>
            </tr>
        </thead>
        <tbody>
            ${mapCalls(c.calls)}
        </tbody>
    </table>`
}).join("\n")

const map = (courses: Array<Course>) => `<!DOCTYPE html>
<html>
<head>
    <title>courses</title>
</head>
<body>
    <h1>courses</h1>
    ${mapCourses(courses)}
</body>
</html>`

export const format = (c: Array<Course>) => (res: express.Response) => {
    return res.format({
        'application/json': () => res.status(200).json(c),
        'text/html': () => res.status(200).send(map(c)),
        default: () => res.status(406).send()
    })
}
