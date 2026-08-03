/**
 * /mod — merged command bundling moderation config/tooling commands as
 * subcommand groups. High-frequency single-action commands (ban, timeout,
 * purge, warnings) stay standalone top-level commands on purpose — staff
 * use those dozens of times a day and shouldn't need an extra keystroke.
 *
 * Groups:
 *   member         ← former /member (kick, nickname, role)
 *   channel        ← former /channel (lock, unlock, slowmode)
 *   restrict       ← former /restrict (lockdown, sticky mute, per-user slowmode)
 *   history        ← former /history (member history)
 *   records        ← former /records (infractions, notes, escalation config, case log)
 *   mass-action    ← former /mass-action (mass-ban, mass-role)
 *   raid-tools     ← former /raid-tools (raidsim, simulate, rollback, end)
 *   reactionroles  ← former /reactionroles
 *   security       ← former /security (anti-nuke, anti-raid, auto-defend, config)
 *   attacksim      ← former /attacksim (wizard)
 *   setup          ← former /mod-setup (complete moderation setup wizard)
 */

import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { copyAsSubcommandGroup, wrapAsSubcommand } from '../../merged/mergeUtils';

import memberCmd from '../../merged/impl/mod-member';
import channelCmd from '../../merged/impl/mod-channel';
import restrictCmd from '../../merged/impl/mod-restrict';
import historyCmd from '../../merged/impl/mod-history';
import recordsCmd from '../../merged/impl/mod-records';
import massActionCmd from '../../merged/impl/mod-mass-action';
import raidToolsCmd from '../../merged/impl/mod-raid-tools';
import reactionRolesCmd from '../../merged/impl/mod-reactionroles';
import securityCmd from '../../merged/impl/mod-security';
import attacksimCmd from '../../merged/impl/mod-attacksim';
import modSetupCmd from '../../merged/impl/mod-mod-setup';

const data = new SlashCommandBuilder()
  .setName('mod')
  .setDescription('Moderation tools & configuration')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

copyAsSubcommandGroup(data, 'member', 'Member actions: kick, nickname, role', memberCmd as any);
copyAsSubcommandGroup(data, 'channel', 'Channel moderation: lock, unlock, slowmode', channelCmd as any);
copyAsSubcommandGroup(data, 'restrict', 'Restriction tools: lockdown, sticky mute, per-user slowmode', restrictCmd as any);
copyAsSubcommandGroup(data, 'mass-action', 'Bulk actions: mass-ban, mass-role (raid control)', massActionCmd as any);
copyAsSubcommandGroup(data, 'raid-tools', 'Raid/attack simulation tools: raidsim, simulate, rollback, end', raidToolsCmd as any);
copyAsSubcommandGroup(data, 'records', 'Member records: infraction history, mod notes, warn escalation config, case log', recordsCmd as any);
copyAsSubcommandGroup(data, 'reactionroles', 'Manage self-assignable button roles', reactionRolesCmd as any);
copyAsSubcommandGroup(data, 'security', 'Server security: anti-nuke, anti-raid, auto-defend, ultra-mode, inactivity-kick, config', securityCmd as any);
copyAsSubcommandGroup(data, 'attacksim', 'Attack simulator wizard — pick a scenario and configure it interactively', attacksimCmd as any);
wrapAsSubcommand(data, 'history', "Show a member's warn / timeout / kick / ban history", historyCmd as any);
wrapAsSubcommand(data, 'setup', 'Complete moderation setup — all filters, security, anti-raid, anti-nuke, warn escalation', modSetupCmd as any);

const GROUP_ROUTES: Record<string, any> = {
  member: memberCmd, channel: channelCmd, restrict: restrictCmd, 'mass-action': massActionCmd,
  'raid-tools': raidToolsCmd, records: recordsCmd, reactionroles: reactionRolesCmd,
  security: securityCmd, attacksim: attacksimCmd,
};
const FLAT_ROUTES: Record<string, any> = { history: historyCmd, setup: modSetupCmd };

export default {
  data,
  async execute(interaction: ChatInputCommandInteraction, client: any) {
    const group = interaction.options.getSubcommandGroup(false);
    if (group && GROUP_ROUTES[group]) return GROUP_ROUTES[group].execute(interaction, client);
    const sub = interaction.options.getSubcommand();
    if (FLAT_ROUTES[sub]) return FLAT_ROUTES[sub].execute(interaction, client);
  },
};
