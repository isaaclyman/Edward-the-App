const payments = require('./payments.helper')
const ts = require('../models/_util').addTimestamps

const verifySignatureMiddleware = (req, res, next) => {
  payments.verifySignature(req).then(() => {
    next()
  }, err => {
    res.status(401).send()
  })
}

const paymentSucceeded = (invoice, db) => {
  db.knex('users').where('stripe_customer_id', invoice.customer).update(ts(db.knex, {
    'payment_period_end': db.knex.raw(`SELECT 'now'::timestamp + '1 month'::interval`)
  }, true))
}

const registerApis = (app, db) => {
  app.post('/payment-event', verifySignatureMiddleware, (req, res) => {
    const { type, data } = res.body

    switch (type) {
      case 'invoice.payment_succeeded':
        return paymentSucceeded(data.object, db).then(() => {
          res.status(200).send()
        }, err => {
          res.status(500).send()
        })
    }

    return res.status(400).send()
  })
}

module.exports = {
  registerApis
}
