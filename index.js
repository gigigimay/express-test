const express = require('express')
const cors = require('cors')
require('dotenv').config()

const router = express.Router()

const DIMMED_COLOR = '\x1b[2m%s\x1b[0m'

router.get('/', (_req, res) => {
  console.log('healthcheck pass')
  res.status(200).send()
})

router.get('/webhook', (req, res) => {
  console.log('healthcheck pass')
  res.status(200).send('/webhook OK')
})

router.post('/webhook', (req, res) => {
  console.log(
    `\n/webhook [${new Date().toLocaleTimeString()}] from: ${
      req.query.from
    }, key: ${req.body.key}, data.id: ${req.body.data.id}`
  )
  console.log(DIMMED_COLOR, JSON.stringify(req.body))
  res.status(200).send(req.body)
})

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

let concurrent = 0

router.post('/delay/*', (req, res) => {
  const seconds = randomIntFromInterval(1, 30)
  concurrent += 1
  console.log(
    '\nDELAY',
    seconds,
    'seconds, concurrent:',
    concurrent,
    '---',
    req.path
  )
  setTimeout(() => {
    const status = Math.random() > 0.7 ? 504 : 500
    // const status = 200

    concurrent -= 1
    console.log(`DELAY ${seconds} seconds DONE. new concurrent: ${concurrent}`)
    res.status(status).send({ message: `bello ${status}` })
  }, seconds * 1000)
})

const startApp = () => {
  const app = express()
  app.set('trust proxy', true)

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.use(cors())

  app.use(router)

  app.use((err, req, res, _next) => {
    console.error(err)
    res.status(500).send(err)
  })

  app.listen(process.env.PORT, process.env.HOST, () =>
    console.log(
      `${
        process.env.NODE_ENV || 'development'
      } server started, listening on http(s)://${process.env.HOST}:${
        process.env.PORT
      }`
    )
  )
}

startApp()
