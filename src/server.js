const express = require('express')
const cors = require('cors')
const status = require('./status')
const controller = require('./controller')
const { port, rewardAccount } = require('./config')
const { version } = require('../package.json')
const { isAddress } = require('web3-utils')

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: '*',
  }),
)

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})

// Log error to console but don't send it to the client to avoid leaking data
app.use((err, req, res, next) => {
  if (err) {
    console.error(err)
    return res.sendStatus(500)
  }
  next()
})

app.get('/', status.index)
app.get('/v1/status', status.status)
app.get('/v1/jobs/:id', status.getJob)
app.post('/v1/poofWithdraw', controller.poofWithdraw)
app.get('/status', status.status)
app.post('/relay', controller.relay)
app.post('/v1/miningReward', controller.miningReward)
app.post('/v1/batchReward', controller.batchReward)
app.post('/v1/miningWithdraw', controller.miningWithdraw)

// v2 endpoint
app.post('/v2/withdraw', controller.withdrawV2)
app.post('/v2/mint', controller.mintV2)

// v3 endpoint
app.post('/v3/withdraw', controller.withdrawV3)
app.post('/v3/mint', controller.mintV3)

// v4 endpoint
app.post('/v4/withdraw', controller.withdrawV4)
app.post('/v4/mint', controller.mintV4)

if (!isAddress(rewardAccount)) {
  throw new Error('No REWARD_ACCOUNT specified')
}

app.listen(port)
console.log(`Relayer ${version} started on port ${port}`)
