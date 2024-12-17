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


    
    const jobsCollection = client.db('joblytic').collection('jobs');
    const jobApplicationCollection = client.db('joblytic').collection('job_applications');


    // jobs Related Api
    app.get('/jobs', async(req, res) =>{
        const email = req.query.email;
        console.log(email)
        let query = {};
        if(email){
            query = {hr_email : email}
        }
        const cursor = jobsCollection.find(query);
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

    // create jobs
    app.post('/jobs', async(req, res) => {
        const newJob = req.body;
        const result = await jobsCollection.insertOne(newJob);
        res.send(result);
    })


    // jobApplication aPi
    app.post('/job-applications', async(req, res) =>{
        const application = req.body;
        const result = await jobApplicationCollection.insertOne(application);
        // not the best way
        const id = application.job_id;
        const query = {_id: new ObjectId(id)}
        const job = await jobsCollection.findOne(query)
        // console.log(job);
        let newCount = 0;
        if(job.applicationCount){
            newCount = job.applicationCount + 1;
        }
        else{
            newCount = 1;
        }
        // now update the job info
        const filter = {_id: new ObjectId(id)};
        const updatedDoc = {
            $set : {
                applicationCount : newCount
            }
        }
        const updateResult = await jobsCollection.updateOne(filter, updatedDoc);
        res.send(result);
    });


    // app.get('/job-applications/:id) ===> get a specific job application by id
    app.get('/job-applications/jobs/:job_id', async(req, res) =>{
        const jobId = req.params.job_id;
        const query = {job_id : jobId}
        const result = await jobApplicationCollection.find(query).toArray();
        res.send(result);
    });

    // update viewApplication Part
    app.patch('/job-applications/:id', async(req, res) => {
        const id = req.params.id;
        const data = req.body;
        const filter = {_id: new ObjectId(id)};
        const updatedDoc = {
            $set : {
                status : data.status
            }
        }
        const result = await jobApplicationCollection.updateOne(filter, updatedDoc);
        res.send(result);
    }) 



    // get all data or one data 1 or many
    app.get('/job-application', async (req, res) =>{
        const email = req.query.email;
        const query = {applicant_email : email}
        const result = await jobApplicationCollection.find(query).toArray();

        // not the correct way
        for(const application of result){
            console.log(application.job_id)
            const query1 = {_id: new ObjectId(application.job_id)}
            const job = await jobsCollection.findOne(query1)
            if(job){
                application.title = job.title;
                application.company = job.company;
                application.location = job.location;
                application.company_logo = job.company_logo;
                application.applicant_email = job.applicant_email;
                application.company = job.company;
                
            }
        }
        res.send(result)
    });


    // app.delete('/job-application/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const query = { _id: new ObjectId(id) };
    //     const result = await jobApplicationCollection.deleteOne(query);
    //     res.send(result);
    //     // console.log(id);
    // });
      


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