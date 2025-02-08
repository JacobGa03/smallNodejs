const express = require("express")
const app = express()
const PORT = 3000
app.use(express.json())

// For Flutter push notifications
const admin = require("firebase-admin")
const serviceAccount = require("C:\\Users\\jagad\\Documents\\Coding\\smallNodejs\\secrets\\driveu-ee379-firebase-adminsdk-anqjy-2d2d762dcc.json")
// So you have permissions to send notifications
// Ensure you the correct path to the Firebase service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

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
// Send the notification
// * Important: Need to save a file as a secret on azure in order to authenticate sending messages
app.post("/send-notification", async (req, res) => {
  // * Needs to be sent in JSON!
  const { title, body, token } = req.body

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  }

  try {
    // Use Firebase to send the message
    const response = await admin.messaging().send(message)
    // Will determine if it was sent successfully on Google's end
    res.status(200).send("Notification sent successfully: " + response)
    console.log("Notification sent successfully: ", response)
  } catch (error) {
    // Usually malformed request
    res.status(500).send("Error sending notification: " + error)
    console.error(error)
  }
})
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
