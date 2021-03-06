import EX from 'express'
import moment from "moment"
import { CourseList, Call } from "../net/courses"

const mapCalls = (entries: Array<Call>): string => entries.map(c => `<tr>
<td>${c.date ? moment(c.date).format('MM/DD/YYYY hh:mm') || "-" : "-"}</td>
<td>${c.location}</td>
<td>${c.type}</td>
<td>${c.openingDates ? moment(c.openingDates).format('MM/DD/YYYY hh:mm') || "-" : "-"}</td>
<td>${c.closingDates ? moment(c.closingDates).format('MM/DD/YYYY hh:mm') || "-" : "-"}</td>
<td>${c.subscriptions}</td>
<td>${c.oldSystem}</td>
<td>${c.notes}</td>
</tr>`).join("\n")

const mapCourse = (courses: CourseList): string => (courses.entries || []).map(c => `
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
).join("\n")

const mapCourses = (courses: CourseList): string => `<!DOCTYPE html>
<html>
<head>
    <title>courses</title>
</head>
<body>
    <h1>courses</h1>
    ${mapCourse(courses)}
</body>
</html>`

const mapPath = (key: string, value: string): string => `<li>${key}: ${value}</li>`

const mapPaths = (paths: Record<string, string>): string => `<!DOCTYPE html>
<html>
<head>
    <title>courses</title>
</head>
<body>
    <h1>courses</h1>
    <ul>
    ${Object.keys(paths).map(c => mapPath(c, paths[c])).join("\n")}
    </ul>
</body>
</html>`

const formatCourses = (c: CourseList) => (res: EX.Response): EX.Response => res.format({
    'application/json': () => res.status(200).json(c),
    'text/html': () => res.status(200).send(mapCourses(c)),
    default: () => res.status(406).send()
})

const formatPaths = (c: Record<string, string>) => (res: EX.Response): EX.Response => res.format({
    'application/json': () => res.status(200).json(c),
    'text/html': () => res.status(200).send(mapPaths(c)),
    default: () => res.status(406).send()
})

export { formatCourses, formatPaths }
