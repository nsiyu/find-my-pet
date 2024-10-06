const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { PinataSDK } = require("pinata");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db("findmypet");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
    process.exit(1);
  }
}

connectToDatabase();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

const upload = multer({ storage: multer.memoryStorage() });

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.user_id;
    next();
  });
};

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await db.collection("users").findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user_id: user._id.toString(),
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
});

app.get("/missing-pets", async (req, res) => {
  try {
    const missingPets = await db.collection("missing-pets").find({}).toArray();

    const petsWithSignedUrls = await Promise.all(
      missingPets.map(async (pet) => {
        try {
          const signedUrl = await pinata.gateways.createSignedURL({
            cid: pet.image,
            expires: 3600, // URL expires in 1 hour
          });
          // Exclude sensitive data like userId
          const { userId, ...petData } = pet;
          return { ...petData, imageUrl: signedUrl };
        } catch (error) {
          console.error("Error creating signed URL for pet:", pet._id, error);
          return { ...pet, imageUrl: null };
        }
      })
    );

    res.status(200).json({
      message: "All missing pets retrieved successfully",
      pets: petsWithSignedUrls,
    });
  } catch (error) {
    console.error("Error retrieving all missing pets:", error);
    res.status(500).json({
      message: "An error occurred while retrieving all missing pets",
    });
  }
});

app.get("/found-pets", async (req, res) => {
  try {
    const foundPets = await db
      .collection("found-pets")
      .find({ status: "found" })
      .toArray();

    const petsWithSignedUrls = await Promise.all(
      foundPets.map(async (pet) => {
        console.log('pet', pet);
        try {
          const signedUrl = await pinata.gateways.createSignedURL({
            cid: pet.picture,
            expires: 3600,
          });
          
          const shelter = await db
            .collection("shelter")
            .findOne({ name: pet.shelter });

          return {
            ...pet,
            pictureUrl: signedUrl,
            shelterInfo: shelter
              ? {
                  name: shelter.name,
                  address: shelter.address,
                  phone: shelter.phone,
                  website: shelter.website,
                }
              : null,
          };
        } catch (error) {
          console.error("Error processing pet:", pet._id, error);
          return { ...pet, pictureUrl: null, shelterInfo: null };
        }
      })
    );

    res.status(200).json({
      message: "All found pets retrieved successfully",
      pets: petsWithSignedUrls,
    });
  } catch (error) {
    console.error("Error retrieving all found pets:", error);
    res.status(500).json({
      message: "An error occurred while retrieving all found pets",
    });
  }
});

app.post("/create_user", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email,
      password: hashedPassword,
      created_at: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    return res.status(201).json({
      message: "User created successfully",
      user_id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while creating the user" });
  }
});

app.post(
  "/register-missing-pet",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        age,
        breed,
        color,
        gender,
        description,
        lastKnownLocation,
      } = req.body;
      const imageFile = req.file;
      const userId = req.userId;

      if (!imageFile) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const file = new File([imageFile.buffer], imageFile.originalname, {
        type: imageFile.mimetype,
      });
      const upload = await pinata.upload.file(file);

      const newPet = {
        name,
        age,
        breed,
        color,
        gender,
        description,
        lastKnownLocation: JSON.parse(lastKnownLocation),
        image: upload.cid,
        userId: new ObjectId(userId),
        createdAt: new Date(),
        status: "missing",
      };

      const result = await db.collection("missing-pets").insertOne(newPet);

      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $push: { pets: result.insertedId } }
        );

      res.status(201).json({
        message: "Missing pet registered successfully",
        petId: result.insertedId.toString(),
        imageCid: upload.cid,
      });
    } catch (error) {
      console.error("Error registering missing pet:", error);
      res.status(500).json({
        message: "An error occurred while registering the missing pet",
      });
    }
  }
);

app.get("/user-missing-pets", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const missingPets = await db
      .collection("missing-pets")
      .find({ userId: new ObjectId(userId) })
      .toArray();

    const petsWithSignedUrls = await Promise.all(
      missingPets.map(async (pet) => {
        try {
          const signedUrl = await pinata.gateways.createSignedURL({
            cid: pet.image,
            expires: 3600, // URL expires in 1 hour
          });
          return { ...pet, imageUrl: signedUrl };
        } catch (error) {
          console.error("Error creating signed URL for pet:", pet._id, error);
          return { ...pet, imageUrl: null };
        }
      })
    );

    res.status(200).json({
      message: "User's missing pets retrieved successfully",
      pets: petsWithSignedUrls,
    });
  } catch (error) {
    console.error("Error retrieving user missing pets:", error);
    res.status(500).json({
      message: "An error occurred while retrieving the user's missing pets",
    });
  }
});
const axios = require('axios');

app.get("/api/shelters", async (req, res) => {
  const { lat, lng, state } = req.query;
  const apiKey = "AIzaSyA4gKKq5zoPhEQvlS7LoDGR_OhStQpi1Ro";
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=animal+shelters+in+${state}&type=animal_shelter&location=${lat},${lng}&radius=500000&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching shelters:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching shelters" });
  }
});

app.post("/register-found-pet", upload.single("picture"), async (req, res) => {
  try {
    const { location, date, shelter } = req.body;
    const pictureFile = req.file;
    console.log(shelter)
    if (!location || !date || !shelter) {
      return res.status(400).json({
        message: "Location, date, and shelter are required fields",
      });
    }

    if (!pictureFile) {
      return res.status(400).json({ message: "Picture file is required" });
    }

    const file = new File([pictureFile.buffer], pictureFile.originalname, {
      type: pictureFile.mimetype,
    });
    const uploadResult = await pinata.upload.file(file);

    const newFoundPet = {
      location: JSON.parse(location),
      date: new Date(date), 
      shelter,
      picture: uploadResult.cid,
      createdAt: new Date(),
      status: "found",
    };

    // Insert the new found pet into the "found-pets" collection
    const result = await db.collection("found-pets").insertOne(newFoundPet);

    res.status(201).json({
      message: "Found pet registered successfully",
      petId: result.insertedId.toString(),
      pictureCid: uploadResult.cid,
    });
  } catch (error) {
    console.error("Error registering found pet:", error);
    res.status(500).json({
      message: "An error occurred while registering the found pet",
    });
  }
});

// Add this new endpoint after your existing endpoints
app.get("/shelters", async (req, res) => {
  try {
    // Fetch all shelters from the "shelters" collection
    const shelters = await db.collection("shelter").find({}).toArray();

    if (shelters.length === 0) {
      // If no shelters exist, create and insert a default shelter
      const defaultShelter = {
        name: "Default Animal Shelter",
        address: "123 Main St, Anytown, USA",
        phone: "(555) 123-4567",
        website: "https://www.defaultshelter.com",
      };

      await db.collection("shelters").insertOne(defaultShelter);
      shelters.push(defaultShelter);
    }

    res.status(200).json({
      message: "Shelters retrieved successfully",
      shelters: shelters,
    });
  } catch (error) {
    console.error("Error retrieving shelters:", error);
    res.status(500).json({
      message: "An error occurred while retrieving shelters",
    });
  }
});

app.get("/shelter/:id", async (req, res) => {
  try {
    const shelterId = req.params.id;
    const shelter = await db
      .collection("shelter")
      .findOne({ _id: new ObjectId(shelterId) });

    if (!shelter) {
      return res.status(404).json({ message: "Shelter not found" });
    }

    res.status(200).json({
      name: shelter.name,
      address: shelter.address,
      phone: shelter.phone,
      website: shelter.website,
    });
  } catch (error) {
    console.error("Error fetching shelter information:", error);
    res.status(500).json({
      message: "An error occurred while fetching shelter information",
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
