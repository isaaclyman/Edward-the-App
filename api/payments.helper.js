const ts = require('../models/_util').addTimestamps
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const planIds = {
  LIMITED: 'LIMITED18',
  PREMIUM: 'PREMIUM18',
  GOLD: 'GOLD18'
}

// CUSTOMERS

const createCustomer = email => {
  return stripe.customers.create({
    email
  })
}

const deleteCustomer = customerId => {
  return stripe.customers.del(customerId)
}

const saveCustomerId = (email, customerId, knex) => {
  return knex('users').where('email', email).update(ts(knex, {
    'stripe_customer_id': customerId
  }, true)).then(() => customerId)
}

const verifyCustomerExists = (defaultEmail, customerId, knex) => {
  if (!customerId) {
    return createCustomer(defaultEmail).then(customer => saveCustomerId(defaultEmail, customer.id, knex))
  }

  return stripe.customers.retrieve(customerId).then(resp => {
    if (!resp) {
      return createCustomer(defaultEmail).then(customer => saveCustomerId(defaultEmail, customer.id, knex))
    }

    return resp.id
  })
}

// SUBSCRIPTIONS

const createLimitedSubscription = (customerId) => {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ plan: planIds.LIMITED }]
  })
}

const deleteSubscription = subscriptionId => {
  return stripe.subscriptions.del(subscriptionId)
}

const getSubscription = subscriptionId => {
  return stripe.subscriptions.retrieve(subscriptionId)
}

const verifyHasLimitedSubscription = (defaultEmail, customerId, knex) => {
  return verifyCustomerExists(defaultEmail, customerId, knex).then(_customerId => {
    customerId = _customerId
    return stripe.subscriptions.list({ customer: customerId })
  }).then(resp => {
    if (!resp.data.length) {
      return createLimitedSubscription(customerId).then(subscription => {
        return knex('users').where('stripe_customer_id', customerId).update(ts(knex, {
          'stripe_subscription_id': subscription.id
        }, true)).then(() => subscription.id)
      })
    }

    return resp.data[0].id
  })
}

const updateSubscription = (subscription, planId, token) => {
  return stripe.subscriptions.update(subscription.id, {
    items: [{
      id: subscription.items.data[0].id,
      plan: planId
    }],
    source: token && token.id
  })
}

// WEBHOOKS

const verifySignature = request => {
  const sig = req.headers["stripe-signature"]
  return stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
}

// ABSTRACT

const createLimitedCustomer = email => {
  let customerId
  return createCustomer(email).then(customer => {
    customerId = customer.id
    return createLimitedSubscription(customerId)
  }).then(subscription => {
    return {
      customerId,
      subscriptionId: subscription.id
    }
  })
}

const deleteAllCustomerData = (customerId, subscriptionId) => {
  return deleteSubscription(subscriptionId).then(() => {
    return deleteCustomer(customerId)
  })
}

const setSubscription = (defaultEmail, customerId, planId, token, knex) => {
  return verifyHasLimitedSubscription(defaultEmail, customerId, knex).then(
    subscriptionId => getSubscription(subscriptionId)
  ).then(
    subscription => updateSubscription(subscription, planId, token)
  )
}

module.exports = {
  deleteAllCustomerData,
  createLimitedCustomer,
  planIds,
  setSubscription,
  verifySignature
}
