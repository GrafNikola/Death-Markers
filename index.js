module.exports = function DeathMarkers(mod) {
	const Message = require('../tera-message')
	const MSG = new Message(mod)
	
	let partyMembers = []
	let spawnedBeacons = []
	let Marker = []
	
	mod.command.add(["dm","partymarkers"], (arg) => {
		if (!arg) {
			mod.settings.enabled = !mod.settings.enabled
			if (!mod.settings.enabled) removeAllMarkers()
			MSG.chat("Death-Markers " + (mod.settings.enabled ? MSG.BLU("on") : MSG.YEL("of")))
		} else if (arg === "set") {
			mod.settings.UseJobSpecificMarkers = !mod.settings.UseJobSpecificMarkers
			MSG.chat("Marker settings " + (mod.settings.UseJobSpecificMarkers ? MSG.BLU("Occupational classification") : MSG.YEL("Unified style")))
		} else {
			MSG.chat("Death-Markers " + MSG.RED("Invalid parameter!"))
		}
	})
	
	mod.game.on('enter_game', () => {
		removeAllMarkers()
	})
	
	mod.hook('S_PARTY_MEMBER_LIST', 7, (event) => {
		partyMembers = event.members
	})
	
	mod.hook('S_DEAD_LOCATION', 2, (event) => {
		if (partyMembers.find(obj => obj.gameId == event.gameId)) {
			spawnMarker(event.gameId, event.loc)
		}
	})
	
	mod.hook('S_SPAWN_USER', 15, (event) => {
		if (partyMembers.find(obj => obj.gameId == event.gameId) && !event.alive) {
			spawnMarker(event.gameId, event.loc)
		}
	})
	
	function spawnMarker(gameId, loc) {
		if (!mod.settings.enabled || gameId == mod.game.me.gameId) return
		
		spawnedBeacons.push(gameId)
		mod.send('S_SPAWN_DROPITEM', 8, {
			gameId: gameId*10n,
			loc: loc,
			item: getSpawnItem(gameId),
			amount: 1,
			expiry: 999999
		})
	}
	
	function getSpawnItem(gameId) {
		if (!mod.settings.UseJobSpecificMarkers) {
			return mod.settings.DefaultItemSpawn
		}
		
		let jobId
		jobId = partyMembers.find(obj1 => obj1.gameId == gameId)
		
		let JobMarkers
		if (JobMarkers = mod.settings.JobSpecificMarkers.find(obj2 => obj2.jobs == jobId.class)) {
			return JobMarkers.marker
		} else {
			return mod.settings.DefaultItemSpawn
		}
	}
	
	mod.hook('S_PARTY_MEMBER_STAT_UPDATE', 3, (event) => {
		if ((event.playerId != mod.game.me.playerId) && (Number(event.curHp) > 0)) {
			if (Marker = partyMembers.find(obj => obj.playerId == event.playerId)) {
				removeMarker(Marker.gameId)
			}
		}
	})
	
	mod.hook('S_LEAVE_PARTY_MEMBER', 2, (event) => {
		if (Marker = partyMembers.find(obj => obj.playerId == event.playerId)) {
			removeMarker(Marker.gameId)
		}
	})
	
	mod.hook('S_LEAVE_PARTY', 1, (event) => {
		removeAllMarkers()
		partyMembers = []
	})
	
	function removeMarker(gameId) {
		if (spawnedBeacons.includes(gameId)) {
			let index = spawnedBeacons.indexOf(gameId)
			spawnedBeacons.splice(index, 1)
			mod.send('S_DESPAWN_DROPITEM', 4, {
				gameId: gameId*10n
			})
		}
	}
	
	function removeAllMarkers() {
		for (let i = 0; i < spawnedBeacons.length; i++) { 
			removeMarker(spawnedBeacons[i])
		}
		spawnedBeacons = []
	}
}
