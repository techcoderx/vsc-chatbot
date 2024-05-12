import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js'
import config from '../config.js'
import logger from '../logger.js'
import { commands } from './commands.js'
import { handler } from './handler.js'

export class Discord {
  private client: Client
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

  async start() {
    await this.client.login(config.discordToken)
    await this.registerCommands()
    this.handleCommands()
  }
}
