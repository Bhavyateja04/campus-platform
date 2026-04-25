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
const API_USER = "1356350900"
const API_SECRET = "ZkGgCxMTFqepK2UaE4ibwCyxsDA52iET"

let textModel
let imageModel

// Load AI models
async function loadModels(){

 const threshold = 0.9

 textModel = await toxicity.load(threshold)
 console.log("Toxicity model loaded")

 imageModel = await mobilenet.load()
 console.log("MobileNet model loaded")

}


// -------------------- REPORT THRESHOLD LOGIC (AI PART) --------------------

function shouldRemovePost(reportCount, totalUsers){

 const threshold = Math.ceil(totalUsers * 0.3)

 console.log("Reports:", reportCount)
 console.log("Threshold:", threshold)

 return reportCount >= threshold

}
// -------------------- LANGUAGE DETECTION --------------------

function containsTelugu(text){

 const teluguRegex = /[\u0C00-\u0C7F]/

 return teluguRegex.test(text)

}

function detectLanguage(text){

 const result = lngDetector.detect(text,1)

 if(result.length === 0){
  return "unknown"
 }

 return result[0][0]

}

// Validate text length
function validateExperience(text){

 if(!text || text.trim().length < 15){
  return false
 }

 if(text.length > 300){
  return false
 }

 return true
}

// Toxic text detection
async function checkText(text){

 const predictions = await textModel.classify([text])

 for(const prediction of predictions){

  if(prediction.results[0].match === true){
   return false
  }

 }

 return true

}

// Sightengine image safety
async function checkImage(filePath){

 try{

  const form = new FormData()

  form.append("media", fs.createReadStream(filePath))
  form.append("models","nudity,violence,weapon")
  form.append("api_user", API_USER)
  form.append("api_secret", API_SECRET)

  const response = await axios.post(
   "https://api.sightengine.com/1.0/check.json",
   form,
   { headers: form.getHeaders() }
  )

  console.log("Sightengine result:", response.data)

  const nudity = response.data.nudity
  const violence = response.data.violence

  const nudityScore = nudity.raw || 0
  const violenceScore = violence.prob || 0

  if(nudityScore > 0.5 || violenceScore > 0.5){
   return false
  }

  return true

 }catch(err){

  console.log("Image moderation error:", err)

  return false

 }
}

async function extractImageText(imagePath){

 const result = await Tesseract.recognize(imagePath,"eng")

 return result.data.text

}
function detectScreenshot(ocrText){

 const wordCount = ocrText.split(/\s+/).length

 if(wordCount > 20){
  return true
 }

 return false

}

// Meme detection
function detectMeme(ocrText){

 const text = ocrText.trim()

 if(text.length > 40){
  return true
 }

 return false

}

// College memory detection using MobileNet
async function detectCollegeMemory(imagePath){

 const img = await loadImage(imagePath)

 const canvas = createCanvas(img.width,img.height)
 const ctx = canvas.getContext("2d")

 ctx.drawImage(img,0,0)

 const tensor = tf.browser.fromPixels(canvas)

 const predictions = await imageModel.classify(tensor)
  
 console.log("Image predictions:", predictions)

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
  "campus"
 ]
if(labels.some(label =>
 allowed.some(a => label.includes(a))
)){
 return true
}

return false
}
app.post("/moderate", upload.single("image"), async (req,res)=>{

 try{

  const text = req.body.text || ""

  // TEXT VALIDATION
  if(!validateExperience(text)){
   return res.json({
    safe:false,
    reason:"Write a proper college memory experience"
   })
  }

  
  // TELUGU SCRIPT CHECK
  if(containsTelugu(text)){
   return res.json({
    safe:false,
    reason:"Please write memories only in English"
   })
  }

  // LANGUAGE DETECTION (Roman Telugu etc.)
  const lang = detectLanguage(text)

  if(lang !== "english"){
   return res.json({
    safe:false,
    reason:"Only English language is allowed"
   })
  }


  const textSafe = await checkText(text)

  if(!textSafe){
   return res.json({
    safe:false,
    reason:"Toxic text detected"
   })
  }

  // IMAGE VALIDATION
  if(!req.file){
   return res.json({
    safe:false,
    reason:"Image is required"
   })
  }

  const filePath = req.file.path

  const imageSafe = await checkImage(filePath)

  if(!imageSafe){
   fs.unlinkSync(filePath)
   return res.json({
    safe:false,
    reason:"Nudity or violence detected"
   })
  }
  // Run OCR once
const ocrText = await extractImageText(filePath)

// Screenshot detection
if(detectScreenshot(ocrText)){
 fs.unlinkSync(filePath)
 return res.json({
  safe:false,
  reason:"Screenshots not allowed"
 })
}

// Meme detection
if(detectMeme(ocrText)){
 fs.unlinkSync(filePath)
 return res.json({
  safe:false,
  reason:"Memes are not allowed"
 })
}
  

  const memory = await detectCollegeMemory(filePath)

  if(!memory){
   fs.unlinkSync(filePath)
   return res.json({
    safe:false,
    reason:"Upload real college memories"
   })
  }

  fs.unlinkSync(filePath)

  return res.json({
   safe:true,
   message:"Memory post approved"
  })

 }catch(err){

  console.log(err)

  return res.json({
   safe:false,
   message:"Moderation error"
  })

 }

})

// Start server
async function startServer(){

 await loadModels()

 app.listen(5000,()=>{
  console.log("AI moderation service running on port 5000")
 })
}

startServer()