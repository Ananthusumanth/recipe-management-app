const express = require("express")
const cors = require("cors")
const path = require("path")
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const app = express()
app.use(express.json())
app.use(cors());


let db = null
let dbPath = path.join(__dirname, "database.db")

const initilizationDBAndServer = async () => {
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(3000, () => {
            console.log("Server is running in http://localhost:3000")
        })
    }
    catch (e){
        console.log(`DB Error : ${e.message}`)
        process.exit(1)
    }
}

initilizationDBAndServer()


app.get("/recipes", async (request, response) => {
    const getDetails = `SELECT * FROM recipeData`
    const dbUser = await db.all(getDetails)
    response.status(200)
    response.send(dbUser)
})

app.post("/recipes", async (request, response) => {
    const {title, ingredients, instructions, categories} = request.body
    const getavailableDetails = `SELECT * FROM recipeData WHERE ingredients='${ingredients}'`
    const dbUser = await db.get(getavailableDetails)
    if (dbUser === undefined) {
        const getDetails = `
        INSERT INTO recipeData (title, ingredients, instructions, categories)
        VALUES (
        '${title}', 
        '${ingredients}', 
        '${instructions}', 
        '${categories}'
        )`
        await db.run(getDetails)
        const message = "Details Successfull"
        response.status(200)
        response.send({message})
    }else {
        const message = "Ingredient Already Exists"
        response.status(400)
        response.send({message})
    }
    
})

app.put("/recipes/:id", async (request, response) => {
    const {id} = request.params
    const {title, ingredients, instructions, categories} = request.body
    const getDetails = `
    UPDATE recipeData
    SET
    title = '${title}', 
    ingredients = '${ingredients}', 
    instructions = '${instructions}', 
    categories = '${categories}'
    WHERE id = ${id}
    `
    await db.run(getDetails)
    const message = "Details Updated"
    response.status(200)
    response.send({message})
})

module.exports = app