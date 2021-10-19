import express from "express"
import moment from "moment"
import { TaxEntryList, TaxEntry, TaxEntryPaymentStatus } from "../taxes"

const mapEntries = (c: Array<TaxEntry>) => {
    return c.map(r => {
        return `<tr>
    <td>${r.invoiceId || ""}</td>
    <td>${r.IUVcode || "-"}</td>
    <td>${r.amount || "-"}</td>
    <td>${r.description}</td>
    <td>${r.expirationDate ? moment(r.expirationDate).format('MM/DD/YYYY') || "-" : "-"}</td>
    <td>${r.reason || "-"}</td>
    <td>${r.paymentStatus ? TaxEntryPaymentStatus[r.paymentStatus] : "-"}</td>
</tr>`
    }).join("\n")
}

const mapList = (list: TaxEntryList) => `<!DOCTYPE html>
<html>
    <head>
        <title>booklet</title>
    </head>
    <body>
        <h1>booklet</h1>
        <table>
            <thead>
                <tr>
                    <th>invoice id</th>
                    <th>IUV code</th>
                    <th>amount</th>
                    <th>description</th>
                    <th>expirationDate</th>
                    <th>reason</th>
                    <th>paymentStatus</th>
                </tr>
            </thead>
            <tbody>
                ${mapEntries(list.entries)}
            </tbody>
        </table>
    </body>
</html>`

export const format = (c: TaxEntryList) => (res: express.Response) => {
    return res.format({
        'text/html': () => res.status(200).send(mapList(c)),
        'application/json': () => res.status(200).json(c),
        default: () => res.status(406).send()
    })
}
