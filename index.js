require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.83ramik.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // await client.connect();

        const tasksCollection = client.db("task-master").collection('tasks');

        console.log('Successfully connected to MongoDB!');

        app.get('/', (req, res) => {
            res.send('Task Master Server');
        });

        app.get('/tasks', async (req, res) => {
            try {
                const tasks = await tasksCollection.find({}).toArray();
                res.json(tasks);
            } catch (err) {
                console.error('Error fetching tasks:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });


        app.get('/tasks/:name', async (req, res) => {
            try {
                const name = req.params.name
                const tasks = await tasksCollection.find({ assignedTo: name }).toArray();
                res.json(tasks);
            } catch (err) {
                console.error('Error fetching tasks:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.post('/tasks', async (req, res) => {
            const newTask = req.body;

            try {
                const result = await tasksCollection.insertOne(newTask);
                res.status(201).json(result);
            } catch (err) {
                console.error('Error creating task:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        app.delete('/tasks/:id', async (req, res) => {
            const taskId = req.params.id;

            try {
                const result = await tasksCollection.deleteOne({
                    _id: new ObjectId(taskId),
                });
                if (result.deletedCount === 0) {
                    res.status(404).json({ error: 'Task not found' });
                } else {
                    res.json({ message: 'Task deleted successfully' });
                }
            } catch (err) {
                console.error('Error deleting task:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });


        app.patch('/tasks/:id', async (req, res) => {
            const taskId = req.params.id;
            const updatedTaskData = req.body;

            try {
                const result = await tasksCollection.updateOne(
                    { _id: new ObjectId(taskId) },
                    { $set: updatedTaskData }
                );

                if (result.matchedCount === 0) {
                    res.status(404).json({ error: 'Task not found' });
                } else {
                    res.json({ message: 'Task updated successfully' });
                }
            } catch (err) {
                console.error('Error updating task:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

    }
    finally { }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});