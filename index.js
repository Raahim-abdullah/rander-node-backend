require("dotenv").config()
const express = require('express')
const Note = require("./models/note.js")
const cros = require('cors')

const app = express()

app.use(express.json())
app.use(express.static('dist'))
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
app.use(cros())
app.use(requestLogger)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message })
    }

    next(error)
}
const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

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

app.get("/", (req, res) => {
    res.send("<h1>Hello, world!</h1>")
})

app.get("/api/notes", (req, res) => {
    Note.find({}).then(notes => {
        res.json(notes)
    })
})

app.get("/api/notes/:id", (req, res, next) => {
    Note.findById(req.params.id)
        .then(note => {
            if (note) {
                res.json(note)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete("/api/notes/:id", (req, res, next) => {
    Note.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).json(result)
        })
        .catch(error => next(error))
})

app.post("/api/notes", (req, res, next) => {
    const body = req.body

    if (!body.content) {
        return res.status(400).json({
            error: "content missing"
        })
    }
    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save()
        .then(savedNote => {
            return res.json(savedNote)
        })
        .catch(error => next(error))
})

app.put("/api/notes/:id", (req, res, next) => {
    const { content, important } = req.body

    Note.findById(req.params.id)
        .then(note => {
            if (!note) {
                return res.status(404).end()
            }

            note.content = content
            note.important = important

            return note.save()
                .then(updateNote => {
                    res.json(updateNote)
                })
        })
        .catch(error => next(error))
})


app.use(unknownEndpoint)
app.use(errorHandler)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
