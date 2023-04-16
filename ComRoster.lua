SLASH_COMMUNITYROSTER1 = '/comroster'
print("|cFF4682B4" .. "/comroster COMMUNITY_NAME_HERE \n download list of players to addon folder" .. "|r ")

local function DownloadCommunityRoster(communityName)

	if communityName == "" or communityName == nil then
		print("Community name needs to be entered in this way: \n\n /comroster Alliance SL 60s \n /comroster Keystone Raiders")
		do return end
	end
	
	local clubId
    for _, info in ipairs(C_Club.GetSubscribedClubs()) do
        if info.name == communityName then
            clubId = info.clubId
            break
        end
    end
	
	if not clubId then
	  print("Error: community not found")
	  return
	end
	
	local playerRoster = playerRoster and wipe(playerRoster) or {}
	local totalMembers = C_Club.GetClubMembers(clubId)
	for i = 1, #totalMembers do
		local memberId = totalMembers[i]
		local memberInfo = C_Club.GetMemberInfo(clubId, memberId)
		local thatPlayerName = memberInfo.name or "XXXXX"
		local faction = memberInfo.faction
		if faction == 1 then
			faction = "Alliance"
		else
			faction = "Horde"
		end
		table.insert(playerRoster, strjoin(" ; ", thatPlayerName, faction, memberId))
	end
	PLAYER_ROSTER = playerRoster
	print("|c00F9858B AFTER the UI is reloaded, the game is exited, or the user logs out, the player roster will download to:|r \n\n /WTF/Account/(AccName)/SavedVariables")
end

SlashCmdList["COMMUNITYROSTER"] = function(msg)
	local communityName = string.trim(msg)
	DownloadCommunityRoster(communityName)
end