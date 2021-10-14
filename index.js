const auth = require('./auth.js')
const careerSelection = require('./career_selection.js')
const fetchCookies = auth.fetchCookies
const fetchCareerSelection = careerSelection.fetchCareerSelection

fetchCookies("21333626", "Tech100812#").then(r => {
    console.log(r)
    return fetchCareerSelection(r)
}).then(r => {
    console.log(r)
}).catch(e => {
    console.log(`ERROR: ${e}`)
})

