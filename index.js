const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const port = process.env.PORT || 5000;
const categories = require('./data/category.json')
const products = require('./data/products.json')
const flashsales = require('./data/flashsales.json')
const brands = require('./data/brands.json')
const brandsproducts = require('./data/brandsproducts.json')

app.get('/categories', (req, res) => {
    res.send(categories)
})
app.get('/products', (req, res) => {
    res.send(products)
})
app.get('/product/:name', (req, res) => {
    const name = req.params.name;
    const productName = products.find(p => p.name == name);
    res.send(productName)
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
app.get('/categories/childcategory/:id', (req, res) => {
    const id = req.params.id;
    console.log(id)
    const childcategoryId = products.filter(p => p.id == id);
    res.send(childcategoryId)
})
app.get('/brands', (req, res) => {
    res.send(brands)
})
app.get('/brandsproducts', (req, res) => {
    res.send(brandsproducts)
})
app.get('/brandsproduct/:categoryId', (req, res) => {
    const id = req.params.categoryId;
    const brandsId = brandsproducts.filter(brand => brand.category_id == id);
    res.send(brandsId)
})
app.get('/brand/:id', (req, res) => {
    const id = req.params.id;
    const brandId = brandsproducts.find(brand => brand.id == id);
    res.send(brandId)
})
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})