const express = require("express");
const { db, firebaseStorage } = require("./firebaseAdmin"); // Import db and firebaseStorage
const router = express.Router();
const multer = require("multer");
const { storage } = multer.memoryStorage();
const upload = multer({ storage: storage });
const path = require('path');
const docs = path.join(__dirname, 'docs');;



const app = express();


//get cat list data
router.get("/cats", async (req, res) => {
  try {
    let catQuery = db.collection("cats");

    const catSnapshot = await catQuery.get();
    const catData = [];
    catSnapshot.forEach((doc) => {
      catData.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(catData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cat data" });
  }
});

//insert
router.post("/add-cat", upload.single("images"), async (req, res) => {
  try {
    const { title, age } = req.body;
    const images = req.file;

    const catRef = db.collection("cats").doc();
    await catRef.set({
      id: catRef.id,
      title,
      age,
    });

    const bucket = firebaseStorage.bucket();
    const imageFileName = `cats/${catRef.id}/${images.originalname}`;
    const imageFile = bucket.file(imageFileName);
    const stream = imageFile.createWriteStream({
      metadata: {
        contentType: images.mimetype,
      },
    });

    stream.on("error", (err) => {
      console.error(err);
      return res.status(500).send(err);
    });

    stream.on("finish", async () => {
      // Get the public URL of the uploaded image
      const publicUrl = await imageFile.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });

      await catRef.update({ images: publicUrl[0] });

      res.status(200).send({ success: true, catId: catRef.id });
    });

    stream.end(images.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

//update
router.put("/cats/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, age  } = req.body;

    const catRef = db.collection("cats").doc(id);
    await catRef.update({
        title,
        age,
    });

    res.status(200).json({ message: "Cat entry updated successfully: ${id} "});
  } catch (error) {
    console.error("Error updating cat entry:", error);
    res.status(500).json({ error: "Error updating cat entry: ${error.message}" });
  }
});

//delete
router.delete("/cats/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("cats").doc(id).delete();
    res.status(200).json({ message: "Cat entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting cat entry:", error);
    res.status(500).json({ error: "Error deleting cat entry" });
  }
});

//insert
router.post("/add-favorite", async (req, res) => {
  try {
    const { title, age } = req.body;

    const catRef = db.collection("cats").doc();
    await catRef.set(
      {
        id: catRef.id,
        title,
        age,
      },
      { ignoreUndefinedProperties: true }
    );

    res.status(200).send({ success: true, catId: catRef.id });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.use('/', express.static(docs));


module.exports = router;





/**
 * openapi: 3.0.0
info:
  version: 1.0.0
  title: Cat API
  description: A RESTful API for managing cat data
servers:
  - url: http://localhost:3000
paths:
  /cats:
    get:
      summary: Get a list of cats
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: string
                    title:
                      type: string
                    age:
                      type: integer
                    images:
                      type: string
    post:
      summary: Add a new cat
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                title:
                  type: string
                age:
                  type: integer
                images:
                  type: string
                  format: binary
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  catId:
                    type: string
  /cats/{id}:
    put:
      summary: Update a cat by ID
      parameters:
        - name: id
          in: path
          required: true
          description: ID of the cat to update
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                age:
                  type: integer
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
    delete:
      summary: Delete a cat by ID
      parameters:
        - name: id
          in: path
          required: true
          description: ID of the cat to delete
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
  /add-favorite:
    post:
      summary: Add a cat to favorites
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  catId:
                    type: string
 * 
 */
