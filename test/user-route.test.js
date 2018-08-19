import request from 'supertest'
const chai = require('chai')
const http = require('chai-http')
const jwt = require('jsonwebtoken')

// import app from '../server/server.js'

require('dotenv').config()

const server = require('../server/server')
const expect = chai.expect
chai.use(http)

// import { dropCollection } from '../db/dbFunctions'

const apiServer = server.app.listen(server.port)

// NOTE: apiServer is a closure and should be defined by this point
const Api = () => chai.request(apiServer)

const util = require('util')
const setTimeoutPromise = util.promisify(setTimeout)


describe('User Route', () => {

  const user = {
    email: 'test5@xyz.com',
    password: 'welcome'
  }

  let loggedUser = undefined

  // before(function () {
  //   //   await dropCollection('users')
  // })

  after(async () => {
    if (!process.env.WATCH) {
      setTimeoutPromise(2500).then((value) => {
        process.exit(0)
      })
    }
  })

  it('should register a new user', async () => {
    const res = await Api()
      .post('/users')
      .send({ user })
    expect(res.body.email).to.equal(user.email)
  })

  it('should login the user', async () => {
    const res = await Api()
      .post('/users/login')
      .send({ user })
    loggedUser = res.body
    const jwtDecoded = jwt.decode(loggedUser.token)
    expect(jwtDecoded.email).to.equal(loggedUser.email)
    expect(jwtDecoded.id).to.equal(loggedUser.id)
  })

  it('should return logged in user information', async () => {
    const res = await Api()
      .get('/user')
      .set('Authorization', `Token ${loggedUser.token}`)
    expect(res.body.email).to.equal(loggedUser.email)
  })

  it('should be able to update user information', async () => {
    const newPwd = 'welcome123'
    const res1 = await Api()
      .put('/user')
      .set('Authorization', `Token ${loggedUser.token}`)
      .send({ user: { password: newPwd } })
    expect(res1.status).to.equal(200)
    const res2 = await Api()
      .post('/users/login')
      .send({ user: { email: user.email, password: newPwd } })
    loggedUser = res2.body
    const jwtDecoded = jwt.decode(loggedUser.token)
    expect(jwtDecoded.email).to.equal(loggedUser.email)
    expect(jwtDecoded.id).to.equal(loggedUser.id)
  }).timeout(10000)
})
