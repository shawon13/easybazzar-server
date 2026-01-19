const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://easybazaar-bcf10.web.app",
      "https://easybazaar-bcf10.firebaseapp.com",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { strict } = require("assert");
const { sign } = require("crypto");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.madtkr7.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//verify token
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unAuthorized access" });
  }
  jwt.verify(token, process.env.ACCES_TOKEN_SECURITY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unAuthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // admin verify after verifyToken
    const adminVerify = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user.role === "admin";
      if (!isAdmin) {
        res.status(403).send({ message: "forbidden access" });
      }
      next();
    };
    // jwt auth
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCES_TOKEN_SECURITY, {
        expiresIn: "3h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ message: "success" });
    });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: false,
        })
        .send({ message: "success" });
    });
    //users
    const usersCollection = client.db("easyBazzar").collection("users");

    app.get("/users", verifyToken, adminVerify, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    //admin create
    app.patch(
      "/users/admin/:id",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.send(result);
      },
    );

    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    app.delete("/users/:id", verifyToken, adminVerify, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // banners
    const bannersCollection = client.db("easyBazzar").collection("banners");
    app.get("/banners", async (req, res) => {
      const result = await bannersCollection.find().toArray();
      res.send(result);
    });

    //benefits
    const benefitsCollection = client.db("easyBazzar").collection("benefits");
    app.get("/benefits", async (req, res) => {
      const result = await benefitsCollection.find().toArray();
      res.send(result);
    });

    //flashsales
    const flashsalesCollection = client
      .db("easyBazzar")
      .collection("flashsales");
    app.get("/flashsales", async (req, res) => {
      const result = await flashsalesCollection.find().toArray();
      res.send(result);
    });

    app.get("/flashsale/:name", async (req, res) => {
      const name = req.params.name;
      const query = {
        name: name,
      };
      const result = await flashsalesCollection.findOne(query);
      res.send(result);
      console.log(result);
    });

    //products
    const productsCollection = client.db("easyBazzar").collection("products");
    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });
    app.get("/product/:name", async (req, res) => {
      const name = req.params.name;
      const query = {
        name: name,
      };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });
    app.post("/product/additem", verifyToken, adminVerify, async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });
    app.patch("/product/update/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          product_id: item.product_id,
          name: item.name,
          image: item.image,
          original_price: item.original_price,
          current_price: item.current_price,
          discount: item.discount,
          rating: item.rating,
          star: item.star,
          category_id: item.category_id,
          quantity: item.quantity,
        },
      };
      const result = await productsCollection.updateOne(filter, updateDoc);
      res.send(result);
      console.log(result);
    });
    app.delete(
      "/product/delete/:id",
      verifyToken,
      adminVerify,
      async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.send(result);
      },
    );
    //search
    app.get("/searchproducts", async (req, res) => {
      const textSearch = req.query.search;
      let query = {};
      if (textSearch) {
        query = { name: { $regex: textSearch, $options: "i" } };
      }
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    //brands
    const brandsCollection = client.db("easyBazzar").collection("brands");
    app.get("/brands", async (req, res) => {
      const result = await brandsCollection.find().toArray();
      res.send(result);
    });

    //brandsproducts
    app.get("/brandsProducts/:brands_id", async (req, res) => {
      const brands_id = req.params.brands_id;
      const query = {
        brand: brands_id,
      };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    //category
    const categoriesCollection = client.db("easyBazzar").collection("category");
    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });

    app.get("/categories/:category_id", async (req, res) => {
      const id = req.params.category_id;
      const query = {
        category_id: id,
      };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/categories/childcategory/:id", async (req, res) => {
      const chaildId = req.params.id;
      const query = {
        product_id: chaildId,
      };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to easyBazzar!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
