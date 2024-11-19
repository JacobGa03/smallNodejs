const express = require("express")
const bodyParser = require("body-parser")
const multer = require("multer")
const path = require("path")
const app = express()
const PORT = 3000
app.use(express.json())

// For Flutter push notifications
const admin = require("firebase-admin")
const serviceAccount = require("C:\\Users\\buscu\\Desktop\\Coding\\node\\secrets\\flutterpush.json")
// So you have permissions to send notifications
// Ensure you the correct path to the Firebase service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/") // Specify the directory to save the uploaded files
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)) // Append timestamp to the filename
  },
})

// Initialize multer with the storage configuration
const upload = multer({ storage: storage })

// Create the uploads directory if it doesn't exist
const fs = require("fs")
const uploadsDir = "uploads"
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

// Just a test route to ensure the front end can reach the backend
app.get("/", (req, res) => {
  // Log to the server that the request was received
  console.log("pinged")
  // Send a response to the client
  res.send("pinged at " + new Date())
})
// Set up a route for file uploads
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.")
  }
  res.send(`File uploaded successfully: ${req.file.filename}`)
})
// Send the notification
app.post("/send-notification", async (req, res) => {
  const { title, body, token } = req.body

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  }

  try {
    const response = await admin.messaging().send(message)
    res.status(200).send("Notification sent successfully: " + response)
    console.log("Notification sent successfully: ", response)
  } catch (error) {
    res.status(500).send("Error sending notification: " + error)
    console.error(error)
  }
  //"fuH7F7nhRAOPZHgwb982r0:APA91bErtAXkrXajJLduZTjV0PkGOdel2x9dr6bt77ubdFpj2nNm3KcPJ-0wKxv-7aMUsVBtgHP4oc89F-KfVF4el3ZQAxyu4ZVa103zu7bVxNQq8Gc6JbQ"
  //"fvPadti6Seue9wMN84NZVy:APA91bHOxxM4gNvCyoNvq57ifW0d898wEbwz-2dV6wjs9cMv8Wv-COJ_rKQRCXvrqXTUcaaC3pKD23k34CM31UHWm9s5HinSbPS9pGHKMDoRATPfZGg7W3M"
})
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
