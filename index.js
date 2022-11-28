const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')


//middle
app.use(cors())
app.use(express.json())


//mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v0uxjmt.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//jwt middle
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log('token', req.headers.authorization)

    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}
async function run() {
    try {
        const categoryCollectons = client.db('resellProducts').collection('bookcategories')
        const categoryName = client.db('resellProducts').collection('categories')
        const usersCollection = client.db('resellProducts').collection('users')
        const bookingsCollection = client.db('resellProducts').collection('bookings')
        //veryfy admin
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }
        const veryfySeller = async (req, res, next) => {
            const decodedEmail = req.decoded.email
            const query = { email: decodedEmail }
            const user = await usersCollection.findOne(query)
            if (user?.role !== 'seller') {
                return res.status(403).send({ message: 'forbidden accesss' })
            }
            next()
        }

        //admin api
        app.put('/users/admin/:id', async (req, res) => {
            const decodedEmail = req.decoded.email
            const query = { email: decodedEmail }
            const user = await usersCollection.findOne(query)
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden acess' })
            }
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        //jwt related 
        app.get('/jwt', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '10h' })
                console.log(token)
                return res.send({ accessToken: token })
            }
            res.status(403), send({ accessToken: '' })
        })
        //get resued books categories
        app.get('/categories', async (req, res) => {
            const query = {}
            const cursor = categoryName.find(query)
            const categories = await cursor.toArray()
            res.send(categories)
        })
        //book categories 
        // app.get('/bookcategories', async (req, res) => {
        //     const query = {}
        //     const cursor = categoryCollectons.find(query)
        //     const categories = await cursor.toArray()
        //     res.send(categories)
        // })
        //get category wise data
        // app.get('/categories/:categoryName', async (req, res) => {
        //     const categoryName = req.params.categoryName
        //     const filter = { categoryName: categoryName }
        //     const result = await categoryCollectons.find(filter)
        //     res.send(result)
        // })
        //category product
        app.get('/categories/:id', async (req, res) => {
            const categoryName = req.params.categoryName
            console.log(categoryName)
            const query = { categoryName: categoryName }
            const products = await categoryCollectons.find(query)
            console.log(products)
            res.send(products)
        })

        //post user from sign up
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        //admin users individual
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const user = await usersCollection.findOne(query)
            res.send({ idAdmin: user?.role === 'admin' })
        })

        //seller user individual 
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const user = await usersCollection.findOne(query)
            res.send({ isSeller: user?.role === 'seller' })
        })
        // get user for all buyers
        app.get('/users', async (req, res) => {
            const query = {}
            const cursor = usersCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // post bookings for books
        app.post('/bookings', async (req, res) => {
            const bookings = req.body

            const result = await bookingsCollection.insertOne(bookings)
            res.send(result)
        })
        //get boking in my orders
        app.get('/bookings', async (req, res) => {
            const email = req.query.email
            // const decodedEmail = req.decoded.email;
            // if (email !== decodedEmail) {
            //     return res.status(403).send({ message: 'forbidden access' });
            // }

            const query = { email: email }
            const cursor = bookingsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //add post product
        app.post('/bookcategories', async (req, res) => {
            const products = req.body
            const result = await categoryCollectons.insertOne(products)
            res.send(result)
        })
        //get products by email
        app.get("/bookcategories", async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = categoryCollectons.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        //users by sellers
        app.get('/users/:role', async (req, res) => {
            const seller = req.params.role
            const query = { role: seller }
            const result = await usersCollection.find(query).toArray()
            console.log(result.role)
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