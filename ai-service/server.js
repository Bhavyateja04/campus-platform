const express = require("express")
const multer = require("multer")
const axios = require("axios")
const cors = require("cors")
const fs = require("fs")
const FormData = require("form-data")

const toxicity = require("@tensorflow-models/toxicity")
const tf = require("@tensorflow/tfjs")

const mobilenet = require("@tensorflow-models/mobilenet")
const { createCanvas, loadImage } = require("canvas")

const Tesseract = require("tesseract.js")
const LanguageDetect = require("languagedetect")
const lngDetector = new LanguageDetect()

const app = express()

app.use(cors())
app.use(express.json())

const upload = multer({ dest: "uploads/" })
const API_USER = process.env.API_USER
const API_SECRET = process.env.API_SECRET

let textModel
let imageModel

// -------------------- LOAD AI MODELS --------------------

async function loadModels() {
  try {
    const threshold = 0.9
    textModel = await toxicity.load(threshold)
    console.log("Toxicity model loaded")
    imageModel = await mobilenet.load()
    console.log("MobileNet model loaded")
  } catch (err) {
    console.error("Failed to load models:", err.message)
    process.exit(1)
  }
}

// -------------------- REPORT THRESHOLD LOGIC --------------------

function shouldRemovePost(reportCount, totalUsers) {
  const threshold = Math.ceil(totalUsers * 0.3)
  console.log("Reports:", reportCount)
  console.log("Threshold:", threshold)
  return reportCount >= threshold
}

// -------------------- LANGUAGE DETECTION --------------------

function containsTelugu(text) {
  const teluguRegex = /[\u0C00-\u0C7F]/
  return teluguRegex.test(text)
}

function detectLanguage(text) {
  const result = lngDetector.detect(text, 1)
  if (result.length === 0) return "unknown"
  return result[0][0]
}

// -------------------- TEXT VALIDATION --------------------

function validateExperience(text) {
  if (!text || text.trim().length < 15) return false
  if (text.length > 300) return false
  return true
}

// -------------------- TOXIC TEXT DETECTION --------------------
// Single definition only — guard against model not loaded

async function checkText(text) {
  if (!textModel) throw new Error("Text model not loaded")
  const predictions = await textModel.classify([text])
  for (const prediction of predictions) {
    if (prediction.results[0].match === true) return false
  }
  return true
}

// -------------------- IMAGE SAFETY (Sightengine) --------------------

async function checkImage(filePath) {
  try {
    const form = new FormData()
    form.append("media", fs.createReadStream(filePath))
    form.append("models", "nudity-2.0,violence,weapon")
    form.append("api_user", API_USER)
    form.append("api_secret", API_SECRET)

    const response = await axios.post(
      "https://api.sightengine.com/1.0/check.json",
      form,
      { headers: form.getHeaders() }
    )

    console.log("Sightengine result:", JSON.stringify(response.data, null, 2))

    const nudity = response.data.nudity
    const violence = response.data.violence

    // Only block explicit content — not skin tone (avoids false positives)
    const isExplicit =
      (nudity.sexual_activity || 0) > 0.5 ||
      (nudity.sexual_display || 0) > 0.5 ||
      (nudity.erotica || 0) > 0.5

    const violenceScore = violence?.prob || 0

    console.log("isExplicit:", isExplicit, "| violenceScore:", violenceScore)

    if (isExplicit || violenceScore > 0.5) return false

    return true
  } catch (err) {
    console.log("Image moderation error:", err.message)
    return false
  }
}

// -------------------- OCR --------------------

async function extractImageText(imagePath) {
  const result = await Tesseract.recognize(imagePath, "eng")
  return result.data.text
}

// Screenshot: lots of real words = likely a UI/chat screenshot
function detectScreenshot(ocrText) {
  const wordCount = ocrText.trim().split(/\s+/).filter(w => w.length > 1).length
  console.log("OCR word count:", wordCount)
  return wordCount > 50
}

// Meme: long character string but few actual words (big bold overlay text)
function detectMeme(ocrText) {
  const trimmed = ocrText.trim()
  const wordCount = trimmed.split(/\s+/).filter(w => w.length > 1).length
  console.log("OCR length:", trimmed.length, "| word count:", wordCount)
  return trimmed.length > 100 && wordCount < 30
}

// -------------------- COLLEGE MEMORY DETECTION (MobileNet) --------------------

async function detectCollegeMemory(imagePath) {
  const img = await loadImage(imagePath)
  const canvas = createCanvas(img.width, img.height)
  const ctx = canvas.getContext("2d")
  ctx.drawImage(img, 0, 0)

  const tensor = tf.browser.fromPixels(canvas)
  const predictions = await imageModel.classify(tensor)

  console.log("MobileNet predictions:", predictions)

  const labels = predictions.map(p => p.className.toLowerCase())

  const allowed = [
    "person",
    "people",
    "crowd",
    "student",
    "uniform",
    "academic gown",
    "school",
    "building",
    "classroom",
    "library",
    "stage",
    "auditorium",
    "campus",
    "suit",
    "tie",
    "military uniform",
    "mortarboard",
    "gown",
    "lawn",
    "park",
    "garden",
    "plaza"
  ]

  const matched = labels.filter(label => allowed.some(a => label.includes(a)))
  console.log("Matched labels:", matched)

  if (matched.length > 0) return true

  return false
}

// -------------------- MODERATE ROUTE --------------------

app.post("/moderate", upload.single("image"), async (req, res) => {
  try {
    const text = req.body.text || ""

    // Text length validation
    if (!validateExperience(text)) {
      return res.json({ safe: false, reason: "Write a proper college memory experience" })
    }

    // Telugu script check
    if (containsTelugu(text)) {
      return res.json({ safe: false, reason: "Please write memories only in English" })
    }

    // Language detection (Roman Telugu etc.)
    const lang = detectLanguage(text)
    console.log("Detected language:", lang)
    if (lang !== "english") {
      return res.json({ safe: false, reason: "Only English language is allowed" })
    }

    // Toxicity check
    const textSafe = await checkText(text)
    console.log("Text safe:", textSafe)
    if (!textSafe) {
      return res.json({ safe: false, reason: "Toxic text detected" })
    }

    // Image required
    if (!req.file) {
      return res.json({ safe: false, reason: "Image is required" })
    }

    const filePath = req.file.path

    // Nudity / violence check
    const imageSafe = await checkImage(filePath)
    console.log("Image safe (Sightengine):", imageSafe)
    if (!imageSafe) {
      fs.unlinkSync(filePath)
      return res.json({ safe: false, reason: "Nudity or violence detected" })
    }

    // OCR — run once, reuse for both checks
    const ocrText = await extractImageText(filePath)
    console.log("OCR text:", ocrText)

    // Screenshot detection
    const isScreenshot = detectScreenshot(ocrText)
    console.log("Is screenshot:", isScreenshot)
    if (isScreenshot) {
      fs.unlinkSync(filePath)
      return res.json({ safe: false, reason: "Screenshots not allowed" })
    }

    // Meme detection
    const isMeme = detectMeme(ocrText)
    console.log("Is meme:", isMeme)
    if (isMeme) {
      fs.unlinkSync(filePath)
      return res.json({ safe: false, reason: "Memes are not allowed" })
    }

    // College memory detection
    const memory = await detectCollegeMemory(filePath)
    console.log("Is college memory:", memory)
    if (!memory) {
      fs.unlinkSync(filePath)
      return res.json({ safe: false, reason: "Upload real college memories" })
    }

    fs.unlinkSync(filePath)
    return res.json({ safe: true, message: "Memory post approved" })

  } catch (err) {
    console.log(err)
    return res.json({ safe: false, message: "Moderation error" })
  }
})

// -------------------- START SERVER --------------------

async function startServer() {
  await loadModels()
  app.listen(5000, () => {
    console.log("AI moderation service running on port 5000")
  })
}

startServer()