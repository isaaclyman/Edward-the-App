const accountTypes = require('../models/accountType')
const Email = require('./email.helper')
const { getUsersOverLimit } = require('./space-used.helper')

// APIs in this file do not update created_at, updated_at columns
module.exports = function (app, passport, db, isAdmin) {
  const route = route => `/api/admin/${route}`

  const countUsersQuery = accountType =>
    db.knex('users').count('id as count').where('account_type', accountType).then(([{ count }]) => count)

  // Emails to all users

  app.get(route('emails/csv'), isAdmin, (req, res, next) => {
    db.knex('users').where('verified', true).select('email').then(users => {
      const emails = users.map(user => user.email).join('\n')

      res.attachment('users.csv')
      res.set('Content-Type', 'application/octet-stream')
      res.send(emails)
    }, err => {
      res.status(500).send(err)
    })
  })

  app.post(route('emails/delete'), isAdmin, (req, res, next) => {
    const { id } = req.body

    db.knex('all_user_emails').where('id', id).del().then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  app.post(route('emails/new'), isAdmin, (req, res, next) => {
    const { content, subject } = req.body

    db.knex('all_user_emails').insert({
      content,
      subject
    }).then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  app.get(route('emails/pending'), isAdmin, (req, res, next) => {
    db.knex('all_user_emails').select().then(emails => {
      res.status(200).send(emails)
    }, err => {
      res.status(500).send(err)
    })
  })

  app.post(route('emails/review'), isAdmin, (req, res, next) => {
    const { id } = req.body

    db.knex('all_user_emails').where('id', id).first().then(({ subject, content }) => {
      return new Email([process.env.ADMIN_EMAIL], subject,
        `${content}\n-------\nTo send, visit ${process.env.BASE_URL}/admin#/send-email/${id}`
      ).send()
    }).then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  app.post(route('emails/send'), isAdmin, (req, res, next) => {
    const { id } = req.body

    db.knex('all_user_emails').where('id', id).first().then(({ content, subject }) => {
      if (!content || !subject) {
        throw new Error('Email not found.')
      }

      return new Email(['all_users@edwardtheapp.com'], subject, content).send()
    }).then(() => {
      return db.knex('all_user_emails').where('id', id).del()
    }).then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  // Comp users

  app.post(route('comp'), isAdmin, (req, res, next) => {
    const { id, months } = req.body
    const dueDate = db.knex.raw(`(SELECT 'now'::timestamp + '${months} months'::interval)`)

    db.knex('users').where('id', id).first().then(user => {
      if (![accountTypes.PREMIUM.name, accountTypes.GOLD.name, accountTypes.ADMIN.name].includes(user.account_type)) {
        throw new Error('This user does not have a premium account and cannot be comped.')
      }

      return db.knex('users').where('id', id).update({
        payment_period_end: dueDate
      })
    }).then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })
  
  app.get(route('comp-users'), isAdmin, (req, res, next) => {
    const monthFromNow = db.knex.raw(`('now'::timestamp + '35 days'::interval)`)
    db.knex('users').where('payment_period_end', '>', monthFromNow).select().then(users => {
      res.status(200).send(users)
    }, err => {
      res.status(500).send(err)
    })
  })

  app.post(route('uncomp'), isAdmin, (req, res, next) => {
    const { id } = req.body

    const monthFromNow = db.knex.raw(`(SELECT 'now'::timestamp + '1 month'::interval)`)
    db.knex('users').where('id', id).update({
      payment_period_end: monthFromNow
    }).then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  // Miscellaneous
  
  app.post(route('delete-unverified'), isAdmin, (req, res, next) => {
    const cutoffDate = db.knex.raw(`('now'::timestamp - '3 days'::interval)`)
    db.knex('users').where('verified', false).andWhere('created_at', '<', cutoffDate).del().then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  app.get(route('space-overages'), isAdmin, (req, res, next) => {
    const premiumsQuery = getUsersOverLimit(accountTypes.PREMIUM.name, 21000000)
    const goldsQuery = getUsersOverLimit(accountTypes.GOLD.name, 263000000)
    Promise.all([premiumsQuery, goldsQuery]).then(([premiums, golds]) => {
      res.status(200).send({ premiums, golds })
    }, err => {
      res.status(500).send(err)
    })
  })

  app.get(route('total-users'), isAdmin, (req, res, next) => {
    Promise.all([
      countUsersQuery(accountTypes.DEMO.name),
      countUsersQuery(accountTypes.LIMITED.name),
      countUsersQuery(accountTypes.PREMIUM.name),
      countUsersQuery(accountTypes.GOLD.name),
      countUsersQuery(accountTypes.ADMIN.name)
    ]).then(([demo, limited, premium, gold, admin]) => {
      res.status(200).send({ demo, limited, premium, gold, admin })
    }, err => {
      res.status(500).send(err)
    })
  })

  app.get(route('unverified-users'), isAdmin, (req, res, next) => {
    db.knex('users').where('verified', false).select().limit(150).orderBy('created_at', 'asc').then(users => {
      res.status(200).send(users)
    }, err => {
      res.status(500).send(err)
    })
  })

  app.get(route('premium-signups'), isAdmin, (req, res, next) => {
    db.knex('users').whereIn('account_type', [accountTypes.PREMIUM.name, accountTypes.GOLD.name])
      .select().limit(150).orderBy('updated_at', 'asc').then(users => {
        res.status(200).send(users)
      }, err => {
        res.status(500).send(err)
      })
  })
}
