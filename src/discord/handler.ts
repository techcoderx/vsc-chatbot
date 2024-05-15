import { APIEmbedField, CacheType, ChatInputCommandInteraction, EmbedBuilder, time } from 'discord.js'
import {
  fetchL2Tx,
  fetchProps,
  fetchTxByL1Id,
  fetchL1ContractCall,
  fetchWitness,
  fetchBlock,
  fetchEpoch
} from '../vsc-explorer/src/requests'
import { VSC_BLOCKS_HOME } from '../constants'
import { getBitsetStrFromHex, getPercentFromBitsetStr, thousandSeperator } from '../vsc-explorer/src/helpers'
import { l1Explorer } from '../vsc-explorer/src/settings'

const boolToStr = (bool: boolean) => (bool ? ':white_check_mark:' : ':x:')

export const handler: {
  [name: string]: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<any>
} = {
  stats: async (interaction) => {
    await interaction.deferReply()
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
    await interaction.followUp({ embeds: [embed] })
  },
  witness: async (interaction) => {
    await interaction.deferReply()
    const username = interaction.options.getString('username', true).trim().toLowerCase()
    const witness = await fetchWitness(username)
    if (!witness.id) return await interaction.followUp({ content: 'Witness ' + username + ' does not exist' })
    const latestUpdateTx = witness.enabled ? witness.enabled_at : witness.disabled_at
    const fields: APIEmbedField[] = [
      { name: 'ID', value: thousandSeperator(witness.id), inline: true },
      { name: 'Username', value: witness.username, inline: true },
      { name: 'Enabled', value: boolToStr(witness.enabled), inline: true },
      { name: 'Up To Date', value: boolToStr(witness.is_up_to_date), inline: true },
      ...(witness.last_block
        ? [
            {
              name: 'Last Block',
              value: `[${thousandSeperator(witness.last_block)}](${VSC_BLOCKS_HOME}/block/${witness.last_block})`,
              inline: true
            }
          ]
        : []),
      { name: 'Produced', value: thousandSeperator(witness.produced), inline: true },
      { name: 'Node DID Key', value: witness.did },
      { name: 'Consensus DID Key', value: witness.consensus_did },
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
      .addFields(fields)
      .setTimestamp()
    await interaction.followUp({ embeds: [embed] })
  },
  'l1-tx': async (interaction) => {
    await interaction.deferReply()
    const trx_id = interaction.options.getString('trx_id', true).trim().toLowerCase()
    const l1_tx = await fetchTxByL1Id(trx_id)
    if (l1_tx.length === 0)
      return await interaction.followUp({ content: 'There are no VSC L1 operations for this transaction ID' })
    for (let t in l1_tx) {
      const rows: APIEmbedField[] = [
        { name: 'ID', value: thousandSeperator(l1_tx[t].id), inline: true },
        { name: 'Timestamp', value: time(new Date(l1_tx[t].ts + 'Z')), inline: true },
        { name: 'Username', value: `[${l1_tx[t].username}](${VSC_BLOCKS_HOME}/@${l1_tx[t].username})`, inline: true },
        { name: 'Type', value: l1_tx[t].type, inline: true },
        { name: 'Nonce', value: thousandSeperator(l1_tx[t].nonce), inline: true },
        {
          name: 'L1 Block',
          value: `[${thousandSeperator(l1_tx[t].l1_block)}](${l1Explorer}/b/${l1_tx[t].l1_block})`,
          inline: true
        }
      ]
      const embed = new EmbedBuilder()
        .setTitle(`VSC L1 Operation #${t}`)
        .setURL(`${VSC_BLOCKS_HOME}/tx/${trx_id}`)
        .addFields(rows)
        .setTimestamp()
      await interaction.followUp({ embeds: [embed] })
    }
  },
  'vsc-tx': async (interaction) => {
    await interaction.deferReply()
    const trx_id = interaction.options.getString('cid', true).trim().toLowerCase()
    const tx = await fetchL2Tx(trx_id)
    if (tx.error) return await interaction.followUp({ content: tx.error })
    const rows: APIEmbedField[] = [
      { name: 'Transaction CID', value: trx_id },
      { name: 'Timestamp', value: time(new Date(tx.ts + 'Z')), inline: true },
      { name: 'L2 Block', value: `[${tx.block_num}](${VSC_BLOCKS_HOME}/block/${tx.block_num})`, inline: true },
      { name: 'Position In Block', value: tx.idx_in_block.toString(), inline: true },
      { name: 'Contract ID', value: `[${tx.contract_id}](${VSC_BLOCKS_HOME}/contract/${tx.contract_id})` },
      { name: 'Contract Action', value: tx.contract_action, inline: true },
      { name: 'Type', value: tx.tx_type, inline: true },
      { name: 'IO Gas', value: (tx.io_gas || 0).toString(), inline: true },
      ...(tx.contract_output && tx.contract_output.length > 0
        ? [{ name: 'Executed Successfully', value: boolToStr(!tx.contract_output.find((out) => !!out.error)) }]
        : [])
    ]
    const embed = new EmbedBuilder()
      .setTitle(`VSC Transaction`)
      .setURL(`${VSC_BLOCKS_HOME}/vsc-tx/${trx_id}`)
      .setFields(rows)
      .setTimestamp()
    await interaction.followUp({ embeds: [embed] })
  },
  'vsc-tx-l1': async (interaction) => {
    await interaction.deferReply()
    const trx_id = interaction.options.getString('trx_id', true).trim().toLowerCase()
    const op_pos = interaction.options.getInteger('op_pos') || 0
    const tx = await fetchL1ContractCall(trx_id, op_pos)
    if (tx.error) return await interaction.followUp({ content: tx.error })
    const fields: APIEmbedField[] = [
      { name: 'Transaction ID', value: trx_id },
      { name: 'Timestamp', value: time(new Date(tx.ts + 'Z')), inline: true },
      { name: 'L1 Block', value: `[${tx.block_num}](${l1Explorer}/b/${tx.block_num})`, inline: true },
      { name: 'Position In Block', value: tx.idx_in_block.toString(), inline: true },
      ...(tx.signers.active.length > 0 ? [{ name: 'Signers (Active)', value: tx.signers.active.join(', ') }] : []),
      ...(tx.signers.posting.length > 0 ? [{ name: 'Signers (Posting)', value: tx.signers.posting.join(', ') }] : []),
      { name: 'Contract ID', value: `[${tx.contract_id}](${VSC_BLOCKS_HOME}/contract/${tx.contract_id})` },
      { name: 'Contract Action', value: tx.contract_action, inline: true },
      { name: 'Type', value: tx.tx_type, inline: true },
      { name: 'IO Gas', value: (tx.io_gas || 0).toString(), inline: true },
      ...(tx.contract_output && tx.contract_output.length > 0
        ? [{ name: 'Executed Successfully', value: boolToStr(!tx.contract_output.find((out) => !!out.error)) }]
        : [])
    ]
    const embed = new EmbedBuilder()
      .setTitle(`VSC L1 Contract Call`)
      .setURL(`${VSC_BLOCKS_HOME}/tx/${trx_id}`)
      .setFields(fields)
      .setTimestamp()
    await interaction.followUp({ embeds: [embed] })
  },
  block: async (interaction) => {
    await interaction.deferReply()
    const block_num = interaction.options.getInteger('block_num', true)
    const block = await fetchBlock(block_num)
    if (block.error) return await interaction.followUp({ content: block.error })
    const fields: APIEmbedField[] = [
      { name: 'Block Number', value: thousandSeperator(block.id), inline: true },
      { name: 'Timestamp', value: time(new Date(block.ts + 'Z')), inline: true },
      { name: 'Transactions', value: thousandSeperator(block.txs), inline: true },
      { name: 'Block CID', value: block.block_hash },
      { name: 'L1 Transaction', value: `[${block.l1_tx}](${VSC_BLOCKS_HOME}/tx/${block.l1_tx})` },
      { name: 'Proposer', value: block.proposer, inline: true },
      { name: 'Participation', value: `${getPercentFromBitsetStr(getBitsetStrFromHex(block.signature.bv)).toFixed(2)}%` }
    ]
    const embed = new EmbedBuilder()
      .setTitle('VSC Block')
      .setURL(`${VSC_BLOCKS_HOME}/block/${block.id}`)
      .setFields(fields)
      .setTimestamp()
    await interaction.followUp({ embeds: [embed] })
  },
  epoch: async (interaction) => {
    await interaction.deferReply()
    const epoch_num = interaction.options.getInteger('epoch_num', true)
    const epoch = await fetchEpoch(epoch_num)
    if (epoch.error) return await interaction.followUp({ content: epoch.error })
    const fields: APIEmbedField[] = [
      { name: 'Epoch Number', value: thousandSeperator(epoch_num), inline: true },
      { name: 'Timestamp', value: time(new Date(epoch.ts + 'Z')), inline: true },
      { name: `Elected Members (${epoch.election.length})`, value: epoch.election.join(', ') },
      { name: 'Election Result Data CID', value: epoch.data_cid },
      { name: 'L1 Transaction', value: `[${epoch.l1_tx}](${VSC_BLOCKS_HOME}/tx/${epoch.l1_tx})` },
      { name: 'Proposer', value: epoch.proposer, inline: true },
      { name: 'Participation', value: `${getPercentFromBitsetStr(getBitsetStrFromHex(epoch.bv)).toFixed(2)}%` }
    ]
    const embed = new EmbedBuilder()
      .setTitle('VSC Epoch')
      .setURL(`${VSC_BLOCKS_HOME}/epoch/${epoch_num}`)
      .setFields(fields)
      .setTimestamp()
    await interaction.followUp({ embeds: [embed] })
  }
}
