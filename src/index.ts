import https from 'https';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

require('dotenv').config()

const transporter: Mail = nodemailer.createTransport({
  service: process.env.SERVICE,
  secure: true,
  auth: {
    user: process.env.EMAIL_BOT,
    pass: process.env.PASSWORD
  }
});

let latestCommit: string;

const options = {
  hostname: 'api.github.com',
  port: 443,
  headers: {
    "User-Agent": "nodejs"
  },
  path: `/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/commits/${process.env.REPO_BRANCH}`,
  method: 'GET'
};

https.get(options, (res) => {
  let data = "";
  res.on('data', chunk => data += chunk)
    .on("end", () => {
      const json = JSON.parse(data);
      latestCommit = json.sha;
      update();
    })

}).on('error', (e) => {
  throw e;
});

function update() {
  cron.schedule('* * * * *', () => {
    https.get(options, (res) => {
      let data = "";
      res.on('data', chunk => data += chunk)
        .on("end", () => {
          const json = JSON.parse(data);
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
        })

    }).on('error', (e) => {
      console.error(e);
    });

    
  });
}


