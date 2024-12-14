const express = require ('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5uoh0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(process.env.DB_USER);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    // jobs Related Api
    const jobsCollection = client.db('joblytic').collection('jobs');
    const jobApplicationCollection = client.db('joblytic').collection('job_applications');


    // create or get
    app.get('/jobs', async(req, res) =>{
        const cursor = jobsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });
    
    // job by id
    app.get('/jobs/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await jobsCollection.findOne(query);
        res.send(result);
    });


    // jobApplication aPi
    app.post('/job-applications', async(req, res) =>{
        const application = req.body;
        const result = await jobApplicationCollection.insertOne(application);
        res.send(result);
    });


    // get all data or one data 1 or many
    app.get('/job-application', async (req, res) =>{
        const email = req.query.email;
        const query = {applicant_email : email}
        const result = await jobApplicationCollection.find(query).toArray();
        res.send(result);
    });
      


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('job server is running');
});

app.listen(port, () => {
    console.log(`job is waiting at : ${port}`)
});