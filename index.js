const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//middle
app.use(cors())
app.use(express.json())


//mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v0uxjmt.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoryCollectons = client.db('resellProducts').collection('bookcategories')


        //get resued books categories
        app.get('/categories', async (req, res) => {
            const query = {}
            const cursor = categoryCollectons.find(query)
            const categories = await cursor.toArray()
            res.send(categories)
        })
        //get category wise data
        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await categoryCollectons.findOne(filter)
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(error => console.error(error))


//basic setup
app.get('/', (req, res) => {
    res.send('Our server is running alhamdulliah')
})

app.listen(port, () => {
    console.log(`Our local server is running on ${port}`)
})