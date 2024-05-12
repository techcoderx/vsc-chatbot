import { ActivityType, Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js'
import config from '../config.js'
import logger from '../logger.js'
import { commands } from './commands.js'
import { handler } from './handler.js'
import { Props } from '../vsc-explorer/src/types/HafApiResult.js'
import { fetchProps } from '../vsc-explorer/src/requests.js'
import { thousandSeperator } from '../vsc-explorer/src/helpers.js'

export class Discord {
  private client: Client
  private vscProps?: Props
  private vscPropsInterval?: NodeJS.Timeout
  private activityInterval?: NodeJS.Timeout

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages]
    })
    this.client.once(Events.ClientReady, (readyClient) => logger.info(`Logged in to Discord as ${readyClient.user.tag}`))
  }

  async registerCommands() {
    const rest = new REST({ version: '10' }).setToken(config.discordToken)
    const data = await rest.put(Routes.applicationCommands(config.discordClientId), { body: commands })
    logger.info('Registered slash commands successfully')
  }

  handleCommands() {
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return
      logger.debug(`Handling command ${interaction.commandName}`)
      if (typeof handler[interaction.commandName] !== 'function')
        return await interaction.reply({ content: 'A handler does not exist for the command', ephemeral: true })
      try {
        await handler[interaction.commandName](interaction)
      } catch (e) {
        logger.error(e)
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        }
      }
    })
  }

  runActivity() {
    this.activityInterval = setInterval(() => {
      if (!this.vscProps) return
      const activityNum = Math.floor(new Date().getTime() / 60000) % 4
      this.client.user!.setActivity({
        type: ActivityType.Custom,
        name: (() => {
          switch (activityNum) {
            case 0:
              return `L1 Head Block: ${thousandSeperator(this.vscProps.last_processed_block)}`
            case 1:
              return `VSC Head Block: ${thousandSeperator(this.vscProps.l2_block_height)}`
            case 2:
              return `Epoch: ${thousandSeperator(this.vscProps.epoch)}`
            case 3:
              return `Witnesses: ${thousandSeperator(this.vscProps.witnesses)}`
            default:
              return ''
          }
        })()
      })
    }, 30000)
  }

  streamProps() {
    fetchProps().then((p) => (this.vscProps = p))
    this.vscPropsInterval = setInterval(async () => (this.vscProps = await fetchProps()), 300000)
  }

  async start() {
    await this.client.login(config.discordToken)
    await this.registerCommands()
    this.handleCommands()
    this.streamProps()
    this.runActivity()
  }
}
