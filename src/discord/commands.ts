import { RESTPostAPIChatInputApplicationCommandsJSONBody, ApplicationCommandOptionType } from 'discord.js'

export const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [
  {
    name: 'stats',
    description: 'Retrieve VSC network general stats'
  },
  {
    name: 'witness',
    description: 'Retrieve VSC witness info',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'username',
        description: 'L1 account username',
        min_length: 3,
        max_length: 16,
        required: true
      }
    ]
  }
]
