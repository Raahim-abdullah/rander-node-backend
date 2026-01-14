const express = require('express')
const cros = require('cors')

const app = express()

app.use(express.json())
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
app.use(cros())
app.use(requestLogger)

let notes = [
    {
        id: "1",
        content: "HTML is easy",
        important: true
    },
    {
        id: "2",
        content: "Browser can execute only JavaScript",
        important: false
    },
    {
        id: "3",
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true
    }
]

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => Number(n.id))) : 0
    return String(maxId + 1)

}

app.get("/", (request, response) => {
    response.send("<h1>Hello, world!</h1>")
})

app.get("/api/notes", (req, res) => {
    res.json(notes)
})

app.get("/api/notes/:id", (request, response) => {
    console.log("yes i ran.")
    const id = request.params.id
    const note = notes.find(n => n.id === id)
    if (note) {
        return response.json(note)
    }
    return response.status(404).end()
})

app.delete("/api/notes/:id", (req, res) => {
    const id = req.params.id
    notes = notes.filter(note => note.id !== id)

    return res.status(204).end()
})

app.post("/api/notes", (req, res) => {
    const body = req.body

    if (!body.content) {
        return res.status(400).json({
            error: "content missing"
        })
    }
    const note = {
        content: body.content,
        important: body.important || false,
        id: generateId(),
    }

    notes = notes.concat(note)
    return res.json(note)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
