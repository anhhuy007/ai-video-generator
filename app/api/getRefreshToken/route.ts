// scripts/getRefreshToken.ts
import { google } from 'googleapis'
import readline from 'readline'

const oauth2Client = new google.auth.OAuth2(
  '558968134768-j6tjr213udqfrfl5rpef1s472rjmfon6.apps.googleusercontent.com',
  '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',
  'http://localhost:3000/api/oauth2callback'
)

const scopes = ['https://www.googleapis.com/auth/youtube.upload']

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
})

console.log('Authorize this app by visiting this url:', authUrl)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Enter the code from that page here: ', async code => {
  const { tokens } = await oauth2Client.getToken(code)
  console.log('Refresh Token:', tokens.refresh_token)
  rl.close()
})
