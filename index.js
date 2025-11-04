const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors({origin: ["http://localhost:5173"], credentials: true}));
app.use(express.json())

// smartdbUser
// pw9A1HguOuXBjtrv


const uri = "mongodb+srv://smartdbUser:pw9A1HguOuXBjtrv@cluster0.2o3am.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('smart server is running')
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db('smart_db');
    const productsCollection = db.collection('products');
    const bidsCollection = db.collection('bids');
    const usersCollection = db.collection('users');

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email }
      const existingUser = await usersCollection.findOne(query)
      if (existingUser) {
        res.send({ message: 'user already exits.' })
      }
      else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }


    })

    // products related api
    app.get('/products', async (req, res) => {
      // const projectFields = {title: 1, price_min: 1, price_max: 1, image: 1}
      // const cursor = productsCollection.find().sort({price_min: -1}).limit(5).project(projectFields);

      const email = req.query.email;
      const query = {}
      if (email) {
        query.email = email;
      }
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/latest-products', async (req, res) => {
      const cursor = productsCollection.find().sort({ created_at: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.findOne(query)
      res.send(result);
    })

    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct)
      res.send(result);
    })

    app.patch('/products/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: new ObjectId(id) }
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price
        }
      }
      const result = await productsCollection.updateOne(query, update)
      res.send(result)
    })

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.deleteOne(query)
      res.send(result);
    })

    // bids related api
    app.get('/bids', async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }
      const cursor = bidsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

   app.get('/products/bids/:id', async (req, res) => {
    const productId = req.params.id;
    const query = { product: productId };
    const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
    const result = await cursor.toArray();
    res.send(result);
});

app.get('/bids', async(req, res) => {

  const query = {};
  if(query.email){
    query.buyer_email = email;
  }
  const cursor = bidsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})

    app.post('/bids', async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    })

    app.delete('/bids/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await bidsCollection.deleteOne(query);
      // console.log(result);
      
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`smart server is running in port: ${port}`);

})