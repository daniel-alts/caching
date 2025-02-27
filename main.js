const express = require('express')
const database = require('./database')
const cache = require('./cache')
const ProgramModel = require('./programs.model')
const app = express()
const PORT = 4000



// define our routes

database.connect()
cache.connect()


app.get('/programs', async (req, res) => {
    const key = `api:get:programs`
    // check cache
    const cachedData = await cache.redis.get(key)

    // if in cache return data
    if (cachedData) {
        console.log('returning data from cache')
        return res.json({ message: 'success retrieved programs', programs: JSON.parse(cachedData) })
    }

    console.log('fetching data from db')
    // if not in cache query db and return data, set data in cache
    const programs = await ProgramModel.find()

    // set data in cache
    await cache.redis.set(key, JSON.stringify(programs), { EX: 24 * 60 * 60 * 7})

    return res.json({ message: 'success retrieved programs', programs })
})


app.get('/programs/:department_id', async (req, res) => {
    const { department_id } = req.params

    console.log(department_id)

    const db_query = { department_id: Number(department_id) }

    const key = `db:programs:${JSON.stringify(db_query)}`
    // check cache
    const cachedData = await cache.redis.get(key)

    // if in cache return data
    if (cachedData) {
        console.log('returning data from cache')
        return res.json({ message: 'success retrieved programs', programs: JSON.parse(cachedData) })
    }

    console.log('fetching data from db')
    // if not in cache query db and return data, set data in cache
    const programs = await ProgramModel.find(db_query)

    // set data in cache
    await cache.redis.set(key, JSON.stringify(programs), { EX: 24 * 60 * 60 * 7})

    return res.json({ message: 'success retrieved programs', programs })
})

// on update or delete of data, delete cache where related query exists
app.patch('/programs/:department_id', async (req, res) => {
    const { department_id } = req.params

    const db_query = { department_id: Number(department_id) }

    const key = `db:programs:${JSON.stringify(db_query)}`

    // if not in cache query db and return data, set data in cache
    const programs = await ProgramModel.findOneAndUpdate(db_query)

    // delete key from redis
    await cache.redis.del(key)

    return res.json({ message: 'success retrieved programs', programs })
})




app.listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`)
})
