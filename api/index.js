const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { PinataSDK } = require('pinata');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db('findmypet');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Could not connect to MongoDB', error);
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
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.user_id;
    next();
  });
};

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await db.collection('users').findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { user_id: user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user_id: user._id.toString()
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
});

app.post('/create_user', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email,
      password: hashedPassword,
      created_at: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    
    return res.status(201).json({
      message: "User created successfully",
      user_id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ message: "An error occurred while creating the user" });
  }
});

app.post('/register-missing-pet', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, age, breed, color, gender, description, lastKnownLocation } = req.body;
    const imageFile = req.file;
    const userId = req.userId;

    if (!imageFile) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const file = new File([imageFile.buffer], imageFile.originalname, { type: imageFile.mimetype });
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
      status: 'missing' 
    };

    const result = await db.collection('missing-pets').insertOne(newPet);

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $push: { pets: result.insertedId } }
    );

    res.status(201).json({
      message: "Missing pet registered successfully",
      petId: result.insertedId.toString(),
      imageCid: upload.cid
    });

  } catch (error) {
    console.error('Error registering missing pet:', error);
    res.status(500).json({ message: "An error occurred while registering the missing pet" });
  }
});

app.get('/user-missing-pets', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const missingPets = await db.collection('missing-pets')
      .find({ userId: new ObjectId(userId) })
      .toArray();

    const petsWithSignedUrls = await Promise.all(missingPets.map(async (pet) => {
      try {
        const signedUrl = await pinata.gateways.createSignedURL({
          cid: pet.image,
          expires: 3600 // URL expires in 1 hour
        });
        return { ...pet, imageUrl: signedUrl };
      } catch (error) {
        console.error('Error creating signed URL for pet:', pet._id, error);
        return { ...pet, imageUrl: null };
      }
    }));

    res.status(200).json({
      message: "User's missing pets retrieved successfully",
      pets: petsWithSignedUrls
    });
    
  } catch (error) {
    console.error('Error retrieving user missing pets:', error);
    res.status(500).json({ message: "An error occurred while retrieving the user's missing pets" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
