const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const port = process.env.PORT || 5000;
const categories = require('./data/category.json')

app.get('/categories', (req, res) => {
    res.send(categories)
})
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})