import EX from 'express'
import { UserDetails } from '../net/user_details'

const map = (details: UserDetails): string => `<!DOCTYPE html>
<html>
<head>
    <title>user details</title>
</head>
<body>
    <h1>user details</h1>
    <h2>${details.fullName}</h2>
    <table>
        <thead>
            <tr>
                <th>picture URL</th>
                <th>residential address</th>
                <th>living address</th>
                <th>living address</th>
                <th>email</th>
                <th>internal email</th>
                <th>phone</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${details.pictureURL || "-"}</td>
                <td>${details.residentialAddress || "-"}</td>
                <td>${details.livingAddress || "-"}</td>
                <td>${details.email || "-"}</td>
                <td>${details.internalEmail || "-"}</td>
                <td>${details.phone || "-"}</td>
            </tr>
        </tbody>
    </table>
</body>
</html>`

export const format = (c: UserDetails) => (res: EX.Response): EX.Response => res.format({
    'application/json': () => res.status(200).json(c),
    'text/html': () => res.status(200).send(map(c)),
    default: () => res.status(406).send()
})
