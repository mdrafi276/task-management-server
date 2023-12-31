const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cors());
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 5000;

require("dotenv").config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6eaz3fu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
   
    const taskCollection = client.db("taskDB").collection("Task");
    const riviewCollection = client.db("taskDB").collection("riview");
    const contactCollection = client.db("taskDB").collection("contact");


    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10d",
      });
      res.send(token);
    });

    // middlewares
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const token = req.headers.authorization;
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "unauthorized access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    //   riview data
    app.post("/contact", async (req, res) => {
      const newsit = req.body;

      const result = await contactCollection.insertOne(newsit);
      res.send(result);
    });
    app.post("/riview", async (req, res) => {
      const newsit = req.body;

      const result = await riviewCollection.insertOne(newsit);
      res.send(result);
    });
    app.get("/riview", async (req, res) => {
        const cursor = riviewCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });
    app.get("/task", async (req, res) => {
        const cursor = taskCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });
   
    app.post("/task", async (req, res) => {
      const newsit = req.body;

      const result = await taskCollection.insertOne(newsit);
      res.send(result);
    });


app.get("/task/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const query = {
      userEmail: email,
    };
    const result = await taskCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
// todo 

app.get("/task/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log("query");
  const result = await taskCollection.findOne(query);
  res.send(result);
  console.log(result)
});

app.post("/task", async (req, res) => {
  try {
    const task = req.body;
    console.log(task);
    const result = await taskCollection.insertOne(task);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const task = req.body;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedData = {
      $set: {
        title: task.title,
        date: task.date,
        description: task.description,
        priority: task.priority,
      },
    };
    const result = await taskCollection.updateOne(filter, updatedData, options);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.delete("/task/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await taskCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

// todo end 

    await client.db("admin").command({ ping: 1 });
    console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {

  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Task menagement sercer is running-----------------------");
});
app.listen(port, () => {
  console.log(
    `Task menagement sercer is running----------------------- ${port}`
  );
});