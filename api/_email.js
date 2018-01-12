const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

class Email {
    constructor(recipients, subject, body) {
        const textBody = body +
        '\n---' +
        '\nThanks for using Edward.' +
        `\nNeed help? Email support@edwardtheapp.com.` +
        `\nOr get in touch on Twitter @EdwardTheApp.`
        
        this.options = {
            from: '"Edward the App" <support@edwardtheapp.com>',
            to: recipients.join(', '),
            subject,
            text: textBody
        }
    }

    send() {
        transporter.sendMail(this.options, (error, info) => {
            if (error) {
                console.error(error)
                throw(error)
            }
        })
    }
}

module.exports = Email