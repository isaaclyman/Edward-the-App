const payments = require('./payments.helper')
const ts = require('../models/_util').addTimestamps

const verifySignatureMiddleware = (req, res, next) => {
  payments.verifySignature(req).then(() => {
    next()
  }, err => {
    res.status(401).send()
  })
}

const paymentSucceeded = ({ customer: customerId }, knex) => {
  return knex('users').where('stripe_customer_id', customerId).update(ts(knex, {
    'payment_period_end': knex.raw(`(SELECT 'now'::timestamp + '1 month'::interval)`)
  }, true))
}

const registerApis = (app, db) => {
  const route = route => `/api/${route}`

  app.post(route('payment-event'), verifySignatureMiddleware, (req, res) => {
    const { type, data } = res.body

    switch (type) {
      case 'invoice.payment_succeeded':
        return paymentSucceeded(data.object, db.knex).then(() => {
          res.status(200).send()
        }, err => {
          res.status(500).send()
        })
    }

    return res.status(400).send()
  })
}

module.exports = {
  registerApis,
  paymentSucceeded
}
