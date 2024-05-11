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
    },
    vscHafApi: {
      type: 'string',
      default: 'https://vsc-haf.techcoderx.com',
      description: 'VSC HAF API URL'
    },
    vscApi: {
      type: 'string',
      default: 'https://api.vsc.eco/api/v1/graphql',
      description: 'VSC GraphQL API URL (including /api/v1/graphql)'
    }
  })
  .parseSync()

export default config
