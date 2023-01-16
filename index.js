const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();

app.use(cors())
app.use(express.json())


// Connect to MongoDB


const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const categorieCollection = client.db('jobPilot').collection('categories');
        const jobsCollection = client.db('jobPilot').collection('jobListings');
        const usersCollection = client.db('jobPilot').collection('users');

        app.get('/categories', async (req, res) => {
            const categories = await categorieCollection.find({}).toArray();
            res.send(categories);
        })

        app.get('/joblistings', async (req, res) => {
            let query = {}
            const category = req.query.category;

            if (category) {
                query = {category: category}
            }

            const jobs = await jobsCollection.find(query).toArray();
            
            res.send(jobs);
        })

        app.put('/users', async (req, res) => {
            const email = req.query.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user
            }

            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.send(result);
        })

        app.get('/users/employer', async (req, res) => {
            const query = { email: req.query.email }
            const user = await usersCollection.findOne(query);

            if (user?.type === 'employer') {
                res.send({isEmployer: user?.type === 'employer'})
            }
        })
        app.get('/users/jobseeker', async (req, res) => {
            const query = { email: req.query.email }
            const user = await usersCollection.findOne(query);

            if (user?.type === 'job seeker') {
                res.send({isJobSeeker: user?.type === 'job seeker'})
            }
        })
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({email: email})
            res.send(user);
        })
    }
    finally {

    }
}
run().catch(console.dir)




app.get('/', async (req, res) => {
    res.send('Server Running Successfully!')
})

app.listen(port, () => {
    console.log(`Listening to port on ${port}`);
})