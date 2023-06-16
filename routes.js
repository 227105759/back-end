const express = require("express");
const { db, firebaseStorage } = require("./firebaseAdmin"); // Import db and firebaseStorage
const router = express.Router();
const multer = require("multer");
const {storage} = multer.memoryStorage();
const upload = multer({ storage: storage });


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
    } catch (error){
        res.status(500).json({ error: "Error fetching cat data" });
    }
});


//update
router.post("/add-cat", upload.single("images"), async(req, res) => {
    try{
        const { title, age } = req.body;
        const images = req.file;

        const catRef = db.collection("cats").doc();
        await catRef.set({
            id: catRef.id,
            title,
            age
        })

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

    } catch (error){
        console.error(error);
        res.status(500).send(error);
    }
})





module.exports = router

