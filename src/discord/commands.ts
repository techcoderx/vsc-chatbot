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
  },
  {
    name: 'l1-tx',
    description: 'Retrieve L1 VSC transaction',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'trx_id',
        description: 'Hive transaction ID',
        min_length: 40,
        max_length: 40,
        required: true
      }
    ]
  },
  {
    name: 'vsc-tx',
    description: 'Retrieve L2 VSC transaction',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'cid',
        description: 'VSC transaction CID',
        min_length: 59,
        max_length: 59,
        required: true
      }
    ]
  },
  {
    name: 'vsc-tx-l1',
    description: 'Retrieve L1 contract call details',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'trx_id',
        description: 'Hive transaction ID of the contract call',
        min_length: 40,
        max_length: 40,
        required: true
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'op_pos',
        description: 'Operation position in transaction (default 0)',
        min_value: 0,
        max_value: 999,
        required: false
      }
    ]
  },
  {
    name: 'block',
    description: 'Retrieve a VSC block',
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'block_num',
        description: 'VSC block number',
        min_value: 1,
        required: true
      }
    ]
  },
  {
    name: 'epoch',
    description: 'Retrieve election results of a VSC epoch',
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'epoch_num',
        description: 'VSC epoch number',
        min_value: 0,
        required: true
      }
    ]
  }
]
