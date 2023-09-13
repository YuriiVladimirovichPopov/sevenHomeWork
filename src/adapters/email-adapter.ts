import nodemailer from 'nodemailer';

export const emailAdapter = {
    async sendEmail(email: string, subject: string, message: string) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: 'papanchik2021@gmail.com',
              pass: 'byfdsqtvsxaqvmua'
            }
          })
         
            const info = await transporter.sendMail({
              from: 'PapanNumberOne <papanchik2021@gmail.com>', 
              to: email, 
              subject: subject, 
              text: "Hello My Lover", 
              html: message
            })

        return info
    }
}