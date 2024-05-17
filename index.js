const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const port = process.env.PORT || 5000;
const categories = require('./data/category.json')
const products = require('./data/products.json')
const flashsales = require('./data/flashsales.json')

app.get('/categories', (req, res) => {
    res.send(categories)
})
app.get('/products', (req, res) => {
    res.send(products)
})
app.get('/product/:id', (req, res) => {
    const id = req.params.id;
    const productId = products.find(p => p.id == id);
    res.send(productId)
})
app.get('/flashsales', (req, res) => {
    res.send(flashsales)
})
app.get('/flashsales/flashsale/:id', (req, res) => {
    const id = req.params.id;
    const saleId = flashsales.find(s => s.id == id);
    res.send(saleId)
})
app.get('/flashsale/:id', (req, res) => {
    const id = req.params.id;
    const saleId = flashsales.find(s => s.id == id);
    res.send(saleId)
})
app.get('/categories/:categoryId', (req, res) => {
    const id = req.params.categoryId;
    console.log(id)
    const categoryId = products.filter(c => c.category_id == id);
    res.send(categoryId)
})
app.get('/categories/:id', (req, res) => {
    const id = req.params.id;
    const productId = products.filter(p => p.id == id);
    res.send(productId)
})
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})