const axios = require("axios")
const FormData = require("form-data")
const fs = require("fs")
const path = require("path")

const API_USER = process.env.API_USER
const API_SECRET = process.env.API_SECRET

async function testAPI() {
  console.log("Testing Sightengine API...")
  console.log("API_USER:", API_USER ? API_USER : "❌ NOT SET")
  console.log("API_SECRET:", API_SECRET ? "✅ SET" : "❌ NOT SET")

  if (!API_USER || !API_SECRET) {
    console.error("\n❌ Missing credentials. Run like this:")
    console.error("  API_USER=your_user API_SECRET=your_secret node test-api.js")
    process.exit(1)
  }

  try {
    // Use a public image URL instead of a file to keep the test simple
    const params = new URLSearchParams()
    params.append("url", "https://sightengine.com/assets/img/examples/example7.jpg")
    params.append("models", "nudity-2.0,violence")
    params.append("api_user", API_USER)
    params.append("api_secret", API_SECRET)

    const response = await axios.get(
      `https://api.sightengine.com/1.0/check.json?${params.toString()}`
    )

    console.log("\n✅ API key is working!")
    console.log("Response:", JSON.stringify(response.data, null, 2))

  } catch (err) {
    if (err.response) {
      console.error("\n❌ API returned an error:")
      console.error("Status:", err.response.status)
      console.error("Data:", JSON.stringify(err.response.data, null, 2))
    } else {
      console.error("\n❌ Network error:", err.message)
    }
  }
}

testAPI()