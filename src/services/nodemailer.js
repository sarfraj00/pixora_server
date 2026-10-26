/*  import { createTransport } from 'nodemailer';
import env from '../config/env.js'


const transporter = createTransport({
   service: "gmail",
   auth: {

      type: "OAuth2",
      user: env.googleUser,
      refreshToken: env.googleRefreshToken,
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret, 

   }
})

transporter.verify((err, success) => {
   if (err) {
      console.log('nodemailer configuration error ', err)
   }
   else {
      console.log('nodemailer configuration successful')
   }
})

export const sendMail = async ({ to, subject, text, html }) => {
   await transporter.sendMail({
      from: env.googleUser,
      to,
      subject,
      text,
      html,

   })

} */



import { createTransport } from 'nodemailer';
import env from '../config/env.js';
import sendinblueTransport from 'nodemailer-sendinblue-transport'

const options = {
  apiKey: env.brevoApiKey 
};


const transporter = createTransport(new sendinblueTransport(options));


transporter.verify((err, success) => {
   if (err) {
      console.log('nodemailer configuration error ', err)
   }
   if(success) {
      console.log('nodemailer configuration successful')
   }
});

export const sendMail = async ({ to, subject, text, html }) => {
   await transporter.sendMail({
      from: env.googleUser,
      to,
      subject,
      text,
      html,

   })

}