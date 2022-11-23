const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

//middle
app.use(cors())
app.use(express.json())





//basic setup
app.get('/', (req, res) => {
    res.send('Our server is running alhamdulliah')
})

app.listen(port, () => {
    console.log(`Our local server is running on ${port}`)
})