import yargs from 'yargs'
import * as dotenv from 'dotenv'

dotenv.config()
const config = yargs(process.argv)
  .env('VSC_CHATBOT')
  .options({
    logLevel: {
      type: 'string',
      default: 'info',
      description: 'Set logging level'
    },
    logFile: {
      type: 'string',
      default: './logs/output.log'
    },
    discordToken: {
      type: 'string',
      demandOption: true,
      description: 'Discord bot token'
    },
    discordClientId: {
      type: 'string',
      demandOption: true,
      description: 'Discord application ID'
    }
  })
  .parseSync()

export default config
