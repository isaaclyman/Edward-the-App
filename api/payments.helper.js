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

const verifyCustomerExists = (email, knex) => {
  return stripe.customers.list({ email }).then(resp => {
    if (!resp.data.length) {
      return createCustomer(email).then(customer => {
        return knex('users').where('email', email).update(ts(knex, {
          'stripe_customer_id': customer.id
        }, true)).then(() => customer.id)
      })
    }

    return resp.data[0].id
  })
}

// SUBSCRIPTIONS

const createSubscription = (customerId, planId) => {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ plan: planId }]
  })
}

const deleteSubscription = subscriptionId => {
  return stripe.subscriptions.del(subscriptionId)
}

const getSubscription = subscriptionId => {
  return stripe.subscriptions.retrieve(subscriptionId)
}

const verifyHasLimitedSubscription = (email, knex) => {
  let customerId
  return verifyCustomerExists(email, knex).then(_customerId => {
    customerId = _customerId
    return stripe.subscriptions.list({ customer: customerId })
  }).then(resp => {
    if (!resp.data.length) {
      return createSubscription(customerId, planIds.LIMITED).then(subscription => {
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
    source: token
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
    return createSubscription(customerId, planIds.LIMITED)
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

const setSubscription = (customerId, subscriptionId, planId, token, knex) => {
  return verifyHasLimitedSubscription(customerId, knex).then(
    () => getSubscription(subscriptionId)
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
