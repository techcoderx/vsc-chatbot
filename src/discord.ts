import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js'
import config from './config.js'

export class Discord {
  private client: Client
  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages]
    })
    this.client.once(Events.ClientReady, (readyClient) => console.log(`Logged in to Discord as ${readyClient.user.tag}`))
  }

  async start() {
    await this.client.login(config.discordToken)
  }
}
