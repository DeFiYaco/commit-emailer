import fetch from 'node-fetch';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

require('dotenv').config()

const url = `https://api.github.com/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/commits/${process.env.REPO_BRANCH}`;

const transporter: Mail = nodemailer.createTransport({
  service: process.env.SERVICE,
  secure: true,
  auth: {
    user: process.env.EMAIL_BOT,
    pass: process.env.PASSWORD
  }
});

let latestCommit: string;

fetch(url)
  .then(res => res.json())
  .then((json) => {
    latestCommit = json.sha;
    update();
  }).catch((err) => {
    throw err;
  });

  
function update() {
  cron.schedule('* * * * *', () => {
    fetch(url)
      .then(res => res.json())
      .then((json) => {
        if (latestCommit != json.sha) {
          latestCommit = json.sha;
          const mailOptions = {
            from: `Commit Bot <${process.env.EMAIL_BOT}>`,
            to: process.env.EMAIL_TO,
            subject: `New commit found for ${process.env.REPO_NAME}`,
            text: JSON.stringify(json.commit.message)
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        }
      });
  });
}


