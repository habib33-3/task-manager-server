import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});

app.get("/", (req, res) => {
  res.send("server started ...");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.txxqmfp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const db = client.db("task-manager");
    const taskCollection = db.collection("tasks");

    app.post("/api/v1/addTask", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);

      res.send(result);
    });

    app.get("/api/v1/tasks/:email/:status", async (req, res) => {
      const { status, email } = req.params;

      const query = { status: status, userEmail: email };
      const result = await taskCollection.find(query).toArray();

      res.send(result);
    });

    app.put("/api/v1/task/updateStatus/:id", async (req, res) => {
      const status = req.body;
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };

      const updatedStatus = {
        $set: {
          status: status.status,
        },
      };

      const result = await taskCollection.updateOne(filter, updatedStatus);

      res.send(result);
    });

    app.put("/api/v1/task/updateTask/:id", async (req, res) => {
      const task = req.body;
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };

      const updatedTask = {
        $set: {
          title: task.title,
          description: task.description,
          deadline: task.deadline,
          priority: task.priority,
        },
      };

      const result = await taskCollection.updateOne(filter, updatedTask);

      res.send(result);
    });

    app.get("/api/v1/task/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await taskCollection.findOne(query);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
