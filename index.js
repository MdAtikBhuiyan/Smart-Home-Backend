const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors')

require('dotenv').config()
const port = 5000 || process.env.PORT;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rh6zv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

    console.log('database connect successfully');
    const deviceCollection = client.db("smartHome").collection("allDevices");
    const buyCollection = client.db("smartHome").collection("buyDevices");


    // add or create device
    app.post('/addDevice', (req, res) => {
        const device = req.body;
        console.log(device);
        deviceCollection.insertOne(device)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })

    // show device in UI
    app.get("/showDevices", (req, res) => {
        deviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    // load single product for payment
    app.get('/device/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        console.log('id', id);
        deviceCollection.find({ _id: id })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })

    // buy device
    app.post('/buyDevice', (req, res) => {
        const buyDevice = req.body;
        console.log('buy', buyDevice);
        buyCollection.insertOne(buyDevice)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // show Buy Device
    app.get('/showBuyDevice/:email', (req, res) => {
        const email = req.params.email;
        console.log('email', email);
        buyCollection.find({ userEmail: email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
    
    // delete device
    app.delete('/deleteDevice/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        deviceCollection?.deleteOne({
            _id: id
        })
            .then(result => {
                console.log('delete', result)
                res.send(result.deletedCount > 0)
            })
    })

});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})