import { APIEmbedField, CacheType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { fetchProps } from '../vsc-explorer/src/requests'
import { VSC_BLOCKS_HOME } from '../constants'
import { thousandSeperator } from '../vsc-explorer/src/helpers'

export const handler: {
  [name: string]: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<any>
} = {
  stats: async (interaction) => {
    const props = await fetchProps()
    const rowOne: APIEmbedField[] = [
      { name: 'Hive Block Height', value: thousandSeperator(props.last_processed_block), inline: true },
      { name: 'VSC Block Height', value: thousandSeperator(props.l2_block_height), inline: true },
      { name: 'L1 Transactions', value: thousandSeperator(props.operations), inline: true }
    ]
    const rowTwo: APIEmbedField[] = [
      { name: 'Epoch', value: thousandSeperator(props.epoch), inline: true },
      { name: 'Witnesses', value: thousandSeperator(props.witnesses), inline: true },
      { name: 'Contract Calls', value: thousandSeperator(props.transactions), inline: true }
    ]
    const rowThree: APIEmbedField[] = [
      { name: 'Contracts', value: thousandSeperator(props.contracts), inline: true },
      { name: 'Anchor Refs', value: thousandSeperator(props.anchor_refs), inline: true },
      { name: 'Bridge Txs', value: thousandSeperator(props.bridge_txs), inline: true }
    ]
    const embed = new EmbedBuilder()
      .setTitle('VSC Network Info')
      .setURL(VSC_BLOCKS_HOME)
      .addFields(rowOne)
      .addFields(rowTwo)
      .addFields(rowThree)
      .setTimestamp()
    await interaction.reply({ embeds: [embed] })
  }
}
