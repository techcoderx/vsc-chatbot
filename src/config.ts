import yargs from 'yargs'
import * as dotenv from 'dotenv'

dotenv.config()
const config = yargs(process.argv)
  .env('VSC_CHATBOT')
  .options({
    logLevel: {
      type: 'string',
      default: 'info'
    },
    logFile: {
      type: 'string',
      default: './logs/output.log'
    },
    discordToken: {
      type: 'string'
    },
    vscHafApi: {
      type: 'string',
      default: 'https://vsc-haf.techcoderx.com'
    },
    vscApi: {
      type: 'string',
      default: 'https://api.vsc.eco/api/v1/graphql'
    }
  })
  .parseSync()

export default config
