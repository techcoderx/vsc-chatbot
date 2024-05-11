import { APIEmbedField, CacheType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { fetchProps, fetchWitness } from '../vsc-explorer/src/requests'
import { VSC_BLOCKS_HOME } from '../constants'
import { thousandSeperator } from '../vsc-explorer/src/helpers'

const boolToStr = (bool: boolean) => (bool ? ':white_check_mark:' : ':x:')

export const handler: {
  [name: string]: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<any>
} = {
  stats: async (interaction) => {
    const props = await fetchProps()
    const row1: APIEmbedField[] = [
      { name: 'Hive Block Height', value: thousandSeperator(props.last_processed_block), inline: true },
      { name: 'VSC Block Height', value: thousandSeperator(props.l2_block_height), inline: true },
      { name: 'L1 Transactions', value: thousandSeperator(props.operations), inline: true }
    ]
    const row2: APIEmbedField[] = [
      { name: 'Epoch', value: thousandSeperator(props.epoch), inline: true },
      { name: 'Witnesses', value: thousandSeperator(props.witnesses), inline: true },
      { name: 'Contract Calls', value: thousandSeperator(props.transactions), inline: true }
    ]
    const row3: APIEmbedField[] = [
      { name: 'Contracts', value: thousandSeperator(props.contracts), inline: true },
      { name: 'Anchor Refs', value: thousandSeperator(props.anchor_refs), inline: true },
      { name: 'Bridge Txs', value: thousandSeperator(props.bridge_txs), inline: true }
    ]
    const embed = new EmbedBuilder()
      .setTitle('VSC Network Info')
      .setURL(VSC_BLOCKS_HOME)
      .addFields(row1)
      .addFields(row2)
      .addFields(row3)
      .setTimestamp()
    await interaction.reply({ embeds: [embed] })
  },
  witness: async (interaction) => {
    const username = interaction.options.getString('username')!.trim().toLowerCase()
    const witness = await fetchWitness(username)
    if (!witness.id) return await interaction.reply({ content: 'Witness ' + username + ' does not exist' })
    const latestUpdateTx = witness.enabled ? witness.enabled_at : witness.disabled_at
    const row1: APIEmbedField[] = [
      { name: 'ID', value: thousandSeperator(witness.id), inline: true },
      { name: 'Username', value: witness.username, inline: true },
      { name: 'Enabled', value: boolToStr(witness.enabled), inline: true }
    ]
    const row2: APIEmbedField[] = [
      { name: 'Up To Date', value: boolToStr(witness.is_up_to_date), inline: true },
      ...(witness.last_block ? [{ name: 'Last Block', value: thousandSeperator(witness.last_block), inline: true }] : []),
      { name: 'Produced', value: thousandSeperator(witness.produced), inline: true }
    ]
    const row3: APIEmbedField[] = [
      { name: 'Node DID Key', value: witness.did },
      { name: 'Last Updated', value: latestUpdateTx ? `[${latestUpdateTx}](${VSC_BLOCKS_HOME}/tx/${latestUpdateTx})` : 'Never' },
      {
        name: 'Git Commit',
        value: witness.git_commit
          ? `[${witness.git_commit}](https://github.com/vsc-eco/vsc-node/commit/${witness.git_commit})`
          : 'Dev'
      }
    ]
    const embed = new EmbedBuilder()
      .setTitle('VSC Witness Info')
      .setURL(`${VSC_BLOCKS_HOME}/@${witness.username}`)
      .addFields(row1)
      .addFields(row2)
      .addFields(row3)
      .setTimestamp()
    await interaction.reply({ embeds: [embed] })
  }
}
