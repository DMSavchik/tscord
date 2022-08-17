import { Client } from "discordx"
import { Category } from "@discordx/utilities"
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js"
import { injectable } from "tsyringe"

import { Slash, Discord, SlashOption } from "@decorators"
import { Guard, UserPermissions } from "@guards"
import { Guild } from "@entities"
import { resolveGuild, simpleSuccessEmbed } from "@utils/functions"
import { Database } from "@services"

import { generalConfig } from '@config'
import { UnknownReplyError } from "@errors"
import { L } from "@i18n"

@Discord()
@injectable()
@Category('Admin')
export default class PrefixCommand {

	constructor(
		private db: Database,
	) {}

	@Slash({ 
		name: 'prefix',
		description: 'Here goes the command description!',
		descriptionLocalizations: {
			...Object.fromEntries(Object.entries(L).map(([lang, local]) => [lang, local.COMMANDS.PREFIX.DESCRIPTION()])),
		},
    })
	@Guard(
		UserPermissions(['Administrator'])
	)
	async prefix(
		@SlashOption({ name: 'prefix', type: ApplicationCommandOptionType.String, required: false }) prefix: string | undefined,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {

	
		const guild = resolveGuild(interaction),
			  guildData = await this.db.getRepo(Guild).findOne({ id: guild?.id || '' })

		if (guildData) {

			guildData.prefix = prefix || null
			this.db.getRepo(Guild).persistAndFlush(guildData)

			simpleSuccessEmbed(
				interaction, 
				localize.COMMANDS.PREFIX.EMBED.DESCRIPTION({ 
					prefix: prefix || generalConfig.simpleCommandsPrefix 
				})
			)
		} 
		else {
			throw new UnknownReplyError(interaction)
		}
			  
	}
}