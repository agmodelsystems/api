import dotenv from 'dotenv'
import Mocha from 'mocha'
import glob from 'glob'
import Knex from 'knex'
import path from 'path'
import fs from 'fs'

if(!process.env.DATABASE_URL) {

  if(!fs.existsSync(path.join('.env.test'))) {
    console.log('Could not find .env.test!')
    process.exit()
  }

  dotenv.load({ path: path.join('.env.test') })

}

const knex = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/server/db/migrations'
  },
  pool: {
    min: 1,
    max: 1
  },
  seeds: {
    directory: './src/server/db/fixtures'
  },
  useNullAsDefault: true
})

const test = async () => {

  const mocha = new Mocha()

  glob.sync('src/@(app|server)/**/*_test.js').map((test) => {
    mocha.addFile(test)
  })

  mocha.suite.beforeAll('migrate and seed', async () => {
    await knex.migrate.rollback()
    await knex.migrate.latest()
    await knex.seed.run()
  })

  mocha.suite.beforeEach('begin transaction', async () => {
    global.knex = await new Promise((resolve, reject) => {
      knex.transaction(tx => {
        resolve(tx)
      }).catch(() => {})
    })
  })

  mocha.suite.afterEach('rollback transaction', async () => {
    global.knex.rollback().catch(() => {})
  })

  mocha.suite.afterAll('rollback database', async () => {
    await knex.migrate.rollback()
  })

  await new Promise((resolve, reject) => {

    mocha.run((failures) => {
      process.exitCode = failures > 0 ? 1 : 0
      resolve()
    })

  })

}

test().then(process.exit)
