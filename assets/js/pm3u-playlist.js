/*

var oPlaylistNavSelector = getEl('playlist_selector_list'), iFirstPlaylistId = false, bDownloadRunning = false, oActivePlaylistWorker = false,
oChannelEpgIds = {}, oEpisodesTiles = getEl('series_tiles'), oCurrentEpisode = false, iAppStartTime = Date.now(), oRecentlyWatchedConf = false;


function bootPlaylistReady( sOnSuccess, sOnFailure ) {

	loadPlaylists(function(iListCount) {
		if( !iCurrentPlaylistId ) {
			iCurrentPlaylistId = 0;
		}

		// Is allowed to load playlist?
		if( !isPremiumAccessAllowed() ) {
			iCurrentPlaylistId = iFirstPlaylistId;
		}

		setActivePlaylist(iCurrentPlaylistId, sOnSuccess, sOnFailure);
		//getPlaylistChannels(iCurrentPlaylistId, sOnSuccess, sOnFailure);

	}, sOnFailure);

}


function playlistDownLoadFinished() {
	bDownloadRunning = false;
	oEpgDownloadStatus.innerHTML = '';
}


function abortPlaylistDownload() {

	if( oActivePlaylistWorker ) {
		oActivePlaylistWorker.terminate();
		oActivePlaylistWorker = false;
	}

	playlistDownLoadFinished();

}


function reloadPlaylist( sOnSuccess ) {

	if( localStorage.getItem('coming-from-settings') ) {
		return;
	}

	if( !bDownloadRunning && oCurrentPlaylist && oCurrentPlaylist.startReload && window.Worker && oCurrentPlaylist.grabtime < (iAppStartTime - 120000)
		&& (oCurrentPlaylist.type === 'url' || oCurrentPlaylist.type === 'xtream') ) {

		//setBootStatusText('Downloading playlist');
		//setBootStatusText(getLang('downloading'));

		localStorage.removeItem('deviceStartup');
		//debug('startup reloading playlist');

		abortPlaylistDownload();
		bDownloadRunning = true;
		oEpgDownloadStatus.innerHTML = getLang('downloadingPlaylist');

		oCurrentPlaylist.status = 'LOADING';
		if( oCurrentPlaylist.error ) {
			oCurrentPlaylist.error = null;
		}

		var oPostData = {
			'playlistData': oCurrentPlaylist,
			'device': sDeviceFamily,
			'version': iDbVersion,
			'silent': true
		};

		oActivePlaylistWorker = new Worker(sPlaylistWorkerPath);
		oActivePlaylistWorker.postMessage(oPostData);

		oActivePlaylistWorker.onmessage = function(e) {
			var sResponseText = e.data;
			if( sResponseText ) {

				var sStatus = getWorkerStatus(sResponseText, 'ERROR');
				if( sStatus ) {
					abortPlaylistDownload();
					return true;
				}

				sStatus = getWorkerStatus(sResponseText, 'COUNT live: ');
				if( sStatus ) {
					oCurrentPlaylist.liveCount = parseInt(sStatus);
					return true;
				}

				sStatus = getWorkerStatus(sResponseText, 'COUNT movie: ');
				if( sStatus ) {
					oCurrentPlaylist.movieCount = parseInt(sStatus);
					return true;
				}

				sStatus = getWorkerStatus(sResponseText, 'COUNT series: ');
				if( sStatus ) {
					oCurrentPlaylist.seriesCount = parseInt(sStatus);
					return true;
				}

				if( sResponseText === 'finish' ) {
					playlistDownLoadFinished();
					oCurrentPlaylist.status = 'OK';
					oCurrentPlaylist.grabtime = Date.now();
					saveCurrentPlaylist(oCurrentPlaylist, sOnSuccess);
				}

			}
		};

		oActivePlaylistWorker.onerror = function(e) {
			abortPlaylistDownload();
		};

	}

}


function setActivePlaylist( sId, sOnSuccess, sOnFailure ) {

	if( aLoadedPlaylists && !aLoadedPlaylists[sId] ) {
		for( sId in aLoadedPlaylists) { break; } // Overwrites playlist ID, if last played one was deleted
	}

	if( aLoadedPlaylists && aLoadedPlaylists[sId] && aLoadedPlaylists[sId].channelCount ) {
		oChannelEpgIds = {};
		removeFilterCategory();
		iCurrentPlaylistId = parseInt(sId);
		localStorage.setItem('iCurrentPlaylistId', sId);
		oCurrentPlaylist = aLoadedPlaylists[sId];
		setCategoriesStatus(); // Update visibility in groups list

		sPlaylistNav = '<li id="current_playlist" class="selector list-item" data-prev="main_nav" data-next="main_nav">' + oCurrentPlaylist.name + ' (' + oCurrentPlaylist.channelCount + ')' + '</li>';
		getEl('active_playlist').innerHTML = oCurrentPlaylist.name;
		getEl('channel_playlist').innerHTML = oCurrentPlaylist.name;

		sPlaylistArchiveType = oCurrentPlaylist.archiveType; // manual configuration
		if( !sPlaylistArchiveType || sPlaylistArchiveType == '-' ) {
			sPlaylistArchiveType = false;
			// Fallback from playlists #EXTM3U
			if( oCurrentPlaylist.catchup && oCurrentPlaylist.catchup.type ) {
				sPlaylistArchiveType = oCurrentPlaylist.catchup.type;
			}
		}

		// Reload needed?
		getPlaylistChannels(sId, function(iPlaylistId) {
			//aActiveChannelList = aChannelList; //sortChannelList(aChannelList);
			reloadPlaylist(function() {
				// Only when reload is successful
				if( iPlaylistId === iCurrentPlaylistId ) {
					getPlaylistChannels(sId, function(iPlaylistId) {
						clearNavCache();
						if( bNavOpened ) {
							buildNav();
						}
						epgBoot();
					}, epgBoot);
				} else {
					epgBoot();
				}
			});
			sOnSuccess(iPlaylistId);
		}, sOnFailure);

		return true;
	}

	sOnFailure();

	return false;

}


function loadPlaylistsFromLocalStorage( sOnSuccess, sOnFailure ) {

	var sPlaylistsStorage = localStorage.getItem('aPlaylists');
	if( sPlaylistsStorage ) {

		iFirstPlaylistId = false;
		setBootStatusText('Loading playlist');
		oPlaylistNavSelector.innerHTML = '';

		try {
			aLoadedPlaylists = JSON.parse(sPlaylistsStorage);
		} catch( e ) {
			if( typeof(sOnFailure) === 'function' ) { sOnFailure(e); }
			return false;
		}

		if( aLoadedPlaylists && typeof(aLoadedPlaylists) === 'object' ) {

			var iListCount = 0;

			for( var iId in aLoadedPlaylists ) {
				var oPlaylist = aLoadedPlaylists[iId];
				if( !oPlaylist ) { continue; }
				if( iFirstPlaylistId === false ) { iFirstPlaylistId = parseInt(iId); }
				iListCount++;
			}

			bNeedNavRefresh = true;

			if( iListCount ) {
				bPlaylistFileLoaded = true;
			}

			var sHtml = '';

			for( var i in aLoadedPlaylists ) {
				if( !aLoadedPlaylists[i].channelCount ) {
					continue;
				}

				var sSelected = '', sName = '';
				if( aLoadedPlaylists[i].name ) {
					sName = aLoadedPlaylists[i].name;
				} else {
					sName = getLang('noPlaylistName');
				}

				if( aLoadedPlaylists[i].channelCount ) {
					sName += ' (' + aLoadedPlaylists[i].channelCount + ')';
				}

				if( iCurrentPlaylistId == i ) {
					sSelected = 'class="selected active"';
				}
				sHtml += '<li data-pid="' + i + '" ' + sSelected + '>' + sName + '</li>';
			}

			sHtml += '<li id="selector_open_playlist_manager" class="i18n icon icon-settings" data-langid="playlistSelectorOpenPm">' + getLang('playlistSelectorOpenPm') + '</li>';

			oPlaylistNavSelector.innerHTML = sHtml;

			if( typeof(sOnSuccess) === 'function' ) { sOnSuccess(iListCount); }
			return true;

		}

	}

	return false;

}


function loadPlaylists( sOnSuccess, sOnFailure ) {

	if( loadPlaylistsFromLocalStorage(sOnSuccess, sOnFailure) ) {
		return;
	}

	// Fallback
	if( bDbInitiated && oDb ) {

		iFirstPlaylistId = false;

		setBootStatusText('Loading playlist');

		aLoadedPlaylists = {};
		//oPlaylistList.className = 'loading';

		var oTx = oDb.transaction("playlistStore"), oStore = oTx.objectStore("playlistStore"),
			oIndex = oStore.index('id'), oRequest = oIndex.openCursor(), iListCount = 0;

		oPlaylistNavSelector.innerHTML = '';

		oRequest.onsuccess = function(event) {
			var oRecord = event.target.result;
			if( oRecord && oRecord.value ) {
				var oPlaylist = oRecord.value, iId = parseInt(oPlaylist.id);
				if( iFirstPlaylistId === false ) { iFirstPlaylistId = iId; }
				aLoadedPlaylists[oPlaylist.id] = oPlaylist;
				iListCount++;
				oRecord.continue();
			}
		};

		oRequest.onerror = function(e) {
			if( typeof(sOnFailure) === 'function' ) { sOnFailure(e); }
		};

		oTx.oncomplete = function() {

			bNeedNavRefresh = true;

			if( iListCount ) {
				bPlaylistFileLoaded = true;
			}

			if( typeof(sOnSuccess) === 'function' ) { sOnSuccess(iListCount); }

			var sHtml = '';

			for( var i in aLoadedPlaylists ) {
				if( !aLoadedPlaylists[i].channelCount ) {
					continue;
				}

				var sSelected = '', sName = '';
				if( aLoadedPlaylists[i].name ) {
					sName = aLoadedPlaylists[i].name;
				} else {
					sName = getLang('noPlaylistName');
				}

				if( aLoadedPlaylists[i].channelCount ) {
					sName += ' (' + aLoadedPlaylists[i].channelCount + ')';
				}

				if( iCurrentPlaylistId == i ) {
					sSelected = 'class="selected active"';
				}
				sHtml += '<li data-pid="' + i + '" ' + sSelected + '>' + sName + '</li>';
			}

			sHtml += '<li id="selector_open_playlist_manager" class="i18n icon icon-settings" data-langid="playlistSelectorOpenPm">' + getLang('playlistSelectorOpenPm') + '</li>';

			oPlaylistNavSelector.innerHTML = sHtml;
		};

	}

}


function getChannelCount() {

	if( aActiveChannelList.length ) {
		return aActiveChannelList.length;
	}

	return aPlaylistChannelList.length;

}


function getChannel( iPos ) {

	if( aActiveChannelList && aActiveChannelList[iPos] ) {
		return aActiveChannelList[iPos];
	}

	return false;

}


var aForcedPosChannels = [], aForcedPositions = {};
function sortForcedPositions() {

	aForcedPosChannels.sort(function(a, b) {
		return b.fposDate - a.fposDate;
	});

	for( var i = 0; i < aForcedPosChannels.length; i++ ) {
		var oCh = aForcedPosChannels[i], iPos = oCh.fpos;
		while( aForcedPositions[iPos] ) {
			iPos++;
		}
		aForcedPositions[iPos] = oCh;
	}

}


// Experimental
function sortChannelList() {

	var result = [], insertPos = 0, aForcedPositions = {}, aForcedDateSorted = [], iLength = aList.length;

	for( var i = 0; i < iLength; i++ ) {
		var oCh = aList[i];
		if( oCh.fposDate ) {
			aForcedDateSorted.push(oCh);
		}
	}

	aForcedDateSorted.sort(function(a, b) {
		return b.fposDate - a.fposDate;
	});

	for( var i = 0; i < aForcedDateSorted.length; i++ ) {
		var oCh = aForcedDateSorted[i], iPos = oCh.fpos;
		while( aForcedPositions[iPos] ) {
			iPos++;
		}
		aForcedPositions[iPos] = oCh;
	}

	console.log(aForcedDateSorted);
	console.log(aForcedPositions);

	for( var i = 0; i < iLength; i++ ) {
		if( aForcedPositions[i] ) {
			result[insertPos] = aForcedPositions[i];
			insertPos++;
			//delete aForcedPositions[i];
		}
		var oCh = aList[i];
		if( typeof(oCh.fpos) !== 'undefined' ) { continue; }
		result[insertPos] = oCh;
		insertPos++;
	}

	for( i in aForcedPositions ) {
		//result[insertPos] = aForcedPositions[i];
		//insertPos++;
	}

	console.log(aList);
	console.log(result);

	return result;
}


function getPlaylistChannels( iPlaylistId, sOnSuccess, sOnFailure ) {

	//setBootStatusText('Loading channels');
	setBootStatusText(getLang('loading'));

	iPlaylistId = parseInt(iPlaylistId);

	var oTx = oDb.transaction("playlistChannels"), oStore = oTx.objectStore("playlistChannels"),
		oIndex = oStore.index('pid'), oRange = IDBKeyRange.only(iPlaylistId), oRequest = oIndex.getAll(oRange);

	aForcedPosChannels = []; aForcedPositions = {};

	oRequest.onsuccess = function(e) {
		aActiveChannelList = e.target.result.filter(r => !r.deleted);
		//aForcedPosChannels = records.filter(r => r.fposDate);
	};

	/*oRequest.onsuccess = function(e) {
		var oRecord = e.target.result;
		if( oRecord && oRecord.value && !oRecord.value.deleted ) {
			aChannelList.push(oRecord.value);
			if( oRecord.value.fposDate ) {
				aForcedPosChannels.push(oRecord.value);
			}
		}
		if( oRecord ) {
			oRecord.continue();
		}
	};*/

	oRequest.onerror = function(e) {
		if( typeof(sOnFailure) === 'function' ) {
			sOnFailure(e);
		}
	};

	oTx.oncomplete = function() {
		//sortForcedPositions();

		if( typeof(sOnSuccess) === 'function' ) {
			sOnSuccess(iPlaylistId);
		}
	};

}


function saveCurrentPlaylist( oPlaylist, sCallback ) {

	if( !oPlaylist ) {
		oPlaylist = oCurrentEditPlaylist;
	}

	if( oPlaylist ) {
		if( oPlaylist.id === -99 ) { return false; }
		//oStore.put(oPlaylist);

		oPlaylist.saved = true;

		try {
			aLoadedPlaylists[oPlaylist.id] = oPlaylist;
			localStorage.setItem('aPlaylists', JSON.stringify(aLoadedPlaylists));
			if( sCallback ) { sCallback(); }
		} catch( e ) {
			showModal(e.message);
		}

	}

	/*var tx = oDb.transaction("playlistStore", "readwrite"), oStore = tx.objectStore("playlistStore");
	if( typeof(sCallback) === 'function' ) {
		tx.oncomplete = sCallback;
	}*/

}


function saveChannel( oChannel, sCallback ) {

	if( !oChannel ) { return false; }
	var tx = oDb.transaction("playlistChannels", "readwrite"), oStore = tx.objectStore("playlistChannels");
	oStore.put(oChannel);
	tx.oncomplete = function() {
		//debug('channel updated in DB');
		if( typeof(sCallback) === 'function' ) {
			sCallback();
		}
	};

}


function setCategoriesStatus() {
	getEl('category_live').classList.toggle('visible', oCurrentPlaylist.liveCount > 0);
	getEl('category_movie').classList.toggle('visible', oCurrentPlaylist.movieCount > 0);
	getEl('category_series').classList.toggle('visible', oCurrentPlaylist.seriesCount > 0);
}


function getPlaylist() {
	return localStorage.getItem('sM3uList');
}


// Fired after Playlist was loaded
function playlistReadyHandler() {

	hideModal();

	try {
		if( bPlaylistFileLoaded ) {
			bSettingsLoaded = true;
			if( AppSettings.isActive('startup-last-channel') ) {
				var sLastStoredGroup = localStorage.getItem('sSelectedGroup');
				if( sLastStoredGroup && sLastStoredGroup !== '__all' ) {
					setGroupFilter(sLastStoredGroup, true);
				}
			}

			buildNav();
			initPlayer();
		}
	} catch( e ) {
		showChannelError('Framework loading error', e.message);
		debugError(e);
	}

}


function showPlaylistSelector() {
	bPlaylistSelectorOpened = true;
	getEl('playlist_selector').classList.add('active');
	oSelectedItem = getCurrentSelectedItem();
}


function hidePlaylistSelector() {
	bPlaylistSelectorOpened = false;
	getEl('playlist_selector').classList.remove('active');
	oSelectedItem = getCurrentSelectedItem();
}


function pickPlaylistSelector( oNavItem, bSkipPremiumCheck ) {

	// Is allowed to load playlist?
	if( !bSkipPremiumCheck && !isPremiumAccessAllowed() ) {
		openPremiumHint();
		return false;
	}

	var iPlaylistId = parseInt(oNavItem.dataset.pid);

	if( oCurrentPlaylist.id === iPlaylistId ) {
		hidePlaylistSelector();
		return false;
	}

	// EPG download running? Close it
	abortEpgDownload();

	var oPlaylistSelector = getEl('playlist_selector'), oActiveNavItem = oPlaylistNavSelector.querySelector('.active');
	if( oActiveNavItem ) { oActiveNavItem.classList.remove('active'); }
	oPlaylistSelector.classList.add('loading-playlist');

	var oCurrentSelected = oPlaylistNavSelector.querySelector('li.selected');
	if( oCurrentSelected ) {
		oCurrentSelected.classList.remove('selected');
	}

	oNavItem.classList.add('selected');
	oXtreamChannelInfo.innerHTML = '';

	// Save last played channel to DB
	if( oCurrentPlaylist ) {
		oCurrentPlaylist.lastChannel = iCurrentChannel;
		saveCurrentPlaylist(oCurrentPlaylist);
	}

	setBootStatusText('Loading playlist from database');
	document.body.classList.add('booting');

	stopStream();
	bChannelReady = false;
	iLastLoadedXtreamInfoId = false;
	oXtreamSeriesInfoCache = false;
	oCurrentEpisode = false;
	setSeriesPlayStatus(false);

	setActivePlaylist(iPlaylistId, function() {

		document.body.classList.remove('booting');
		oPlaylistSelector.classList.remove('loading-playlist');
		oNavItem.classList.add('active');

		hidePlaylistSelector();
		hideSeriesSelector();
		removeGroupFilter();
		resetSearchField();
		hideAdvancedNav();
		hideGroups();
		clearNavCache();

		var iLoadChannel = 0; iCurrentChannel = false;
		if( oCurrentPlaylist.lastChannel && AppSettings.isActive('startup-last-channel') ) {
			iLoadChannel = oCurrentPlaylist.lastChannel;
		}

		var aLastChannel = aActiveChannelList[iLoadChannel];
		if( aLastChannel && aLastChannel.type === 'series' ) {
			iCurrentChannel = iLoadChannel;
		} else {
			loadChannel(iLoadChannel);
		}

		if( bChannelReady ) {
			hideNav();
			buildNav();
		} else {
			showNav();
		}

		// start EPG grab
		startEgpGrabbing();

		//showGroups();
	}, function() {
		// error
		document.body.classList.remove('booting');
		showModal("Cannot load playlist. Please reload app.");
	});

}


//// Xtream
var aSeriesEpisodes = false, bSeriesPlaying = false, iActiveSeason = 0, iActiveEpisode = 0, oSeasonTiles = getEl('season_tiles');

function showXstreamSeriesSelector( iForceSeason ) {

	//initXtreamSlider(); // Init slider events

	aSeriesEpisodes = oXtreamSeriesInfoCache.episodes;
	var aInfo = oXtreamSeriesInfoCache.info, sHtml = '', iSeriesCount = 0;
	var oTimes = getWatchedSeriesTimes(iLastLoadedXtreamInfoId, iCurrentPlaylistId);

	if( !aInfo || !aSeriesEpisodes ) {
		showModal("Cannot load episodes from server.");
		hideSeriesSelector();
		showNav();
		return false;
	}

	oEpisodesTiles.innerHTML = '';
	getEl('series_headline').innerHTML = '<h2>' + aInfo.name + '</h2>';
	if( aInfo.backdrop_path && aInfo.backdrop_path[0] ) {
		getEl('series_container').style.backgroundImage = 'url(' + aInfo.backdrop_path[0] + ')';
	} else {
		getEl('series_container').style.backgroundImage = 'none';
	}

	if( iForceSeason ) {
		iActiveSeason = iForceSeason;
		if( oTimes[iActiveSeason] && oTimes[iActiveSeason].lastEp ) {
			iActiveEpisode = oTimes[iActiveSeason].lastEp;
		} else {
			iActiveEpisode = 0;
		}
	} else if( oTimes.last ) {
		iActiveSeason = parseInt(oTimes.last.sid);
		iActiveEpisode = parseInt(oTimes.last.eid);
	}

	if( !iActiveSeason || !aSeriesEpisodes[iActiveSeason] ) {
		iActiveSeason = 1;
	}

	if( !iActiveEpisode ) {
		iActiveEpisode = 0;
	}

	for( var i in aSeriesEpisodes ) {

		var oSeason = aSeriesEpisodes[i];
		iSeriesCount++;

		if( iActiveSeason != i ) {
			continue;
		}

		var iLength = 0;
		for( var x in oSeason ) {

			var oEp = oSeason[x], sTileText = '', sTileImg = '', sTimeline = '', sImgUrl = oEp.info.cover_big, sSelected = '', oEpisodeEl = document.createElement('div');

			if( !sImgUrl ) {
				sImgUrl = oEp.info.movie_image;
			}

			if( oEp.episode_num ) {
				sTileText = 'S' + i + ' EP' + oEp.episode_num;
			} else {
				sTileText = oEp.title;
			}

			if( sImgUrl ) {
				sTileImg = '<img loading="lazy" class="series-tile-img" src="' + sImgUrl + '" alt="">';
			} else {
				sTileImg = '<span class="series-tile-img"></span>';
			}

			if( oEp.info.duration_secs && oTimes[i] && oTimes[i][x] ) {
				oEpisodeEl.dataset.timepos = oTimes[i][x];
				var iWatchedPct = Math.round((parseInt(oTimes[i][x]) * 100) / parseInt(oEp.info.duration_secs));
				sTimeline = '<div class="info-watch-time"><div class="watch-time-elapsed" style="width: ' + iWatchedPct + '%"></div></div>';
			}

			oEpisodeEl.className = 'series-tile slide-item';
			oEpisodeEl.dataset.sid = i;
			oEpisodeEl.dataset.eid = x;
			oEpisodeEl.innerHTML = '<span class="series-tile-text">' + sTileText + '</span>' + sTimeline + sTileImg;
			oEpisodeEl.onclick = function() {
				playEpisode(this);
			};

			oEpisodeEl.onmouseenter = function(oEv) {
				loadEpisodeDescription(this.dataset.eid);
			};

			oEp.refEl = oEpisodeEl;
			oEpisodesTiles.appendChild(oEp.refEl);
			iLength++;

		}

		oEpisodesTiles.dataset.itemsCount = iLength;

	}

/*
if( iSeriesCount > 1 && !oSeasonTiles ) {
	oSeasonTiles = document.createElement('div');
	oSeasonTiles.id = 'series_picker_select';
	oSeasonTiles.className = 'selector';
	oSeasonTiles.name = 'series_picker_select';
	oSeasonTiles.title = 'Select season';
	oSeasonTiles.onchange = function(sVal) { changeActiveSeason(sVal); };
	oSeasonTiles.onclick = function() { showCustomSelector(this); };
	var sSeriesPickerOptions = '';
	for( var i = 1; i <= iSeriesCount; i++ ) {
		var sSelected = (i == iActiveSeason) ? 'option-selected' : '';
		sSeriesPickerOptions += '<div class="selector-option ' + sSelected + '" value="' + i + '">' + getLang('season') + ' ' + i + '</div>';
	}
	oSeasonTiles.innerHTML = sSeriesPickerOptions;
	getEl('season_picker').appendChild(oSeasonTiles);
}
*/

	if( !bSeriesSelectorLoaded ) {
		bSeriesSelectorLoaded = true;

		var iLength = 0;
		for( var i = 1; i <= iSeriesCount; i++ ) {
			var oSeasonEl = document.createElement('div');
			oSeasonEl.id = 'season_tile_' + i;
			oSeasonEl.className = 'season-tile slide-item';
			oSeasonEl.dataset.sid = i;
			oSeasonEl.innerHTML = i;
			oSeasonEl.onclick = function() { changeActiveSeason(this.dataset.sid); };
			if( i == iActiveSeason ) {
				oSeasonEl.classList.add('selected');
			}
			oSeasonTiles.appendChild(oSeasonEl);
			iLength++;
		}

		oSeasonTiles.dataset.itemsCount = iLength;

	}

	loadEpisodeDescription();

}

function hideSeriesSelector() {

	if( bSeriesSelectorOpened ) {

		bSeriesSelectorOpened = false;
		bSeriesSelectorLoaded = false;
		aSeriesEpisodes = false;
		oSeasonTiles.innerHTML = '';
		oEpisodesTiles.innerHTML = '';

		getEl('series_selector').classList.remove('active', 'loading-series');
		getEl('series_headline').innerHTML = '';
		getEl('series_description').innerHTML = '';
		getEl('series_container').style.backgroundImage = null;

		iActiveSeason = 0;
		iActiveEpisode = 0;

		try {
			if( oXtreamRequest ) {
				oXtreamRequest.abort();
				oXtreamRequest = false;
			}
		} catch( e ) { debugError(e) };

	}

}


function getWatchTimes() {

	if( !aWatchTimes ) {
		aWatchTimes = localStorage.getItem('aWatchTimes');
		if( !aWatchTimes ) {
			aWatchTimes = {};
		} else {
			aWatchTimes = JSON.parse(aWatchTimes);
		}
	}

	return aWatchTimes;

}


function getWatchedVodTime( iXtreamId, iPlaylist ) {

	var oWatchTimesPlaylist = getWatchTimes(), sKey = iPlaylist + '|' + iXtreamId + '|vod';
	if( oWatchTimesPlaylist[sKey] ) {
		return oWatchTimesPlaylist[sKey];
	}

	return false;

}


function setWatchedXtreamTime( iSeconds, iXtreamId, sType, iPlaylist ) {

	getWatchTimes();
	var sKey = iPlaylist + '|' + iXtreamId + '|' + sType;

	if( !aWatchTimes[sKey] ) {
		aWatchTimes[sKey] = {};
	}

	if( sType === 'series' && oCurrentEpisode && oCurrentEpisode.episodeId ) {
		var iSid = oCurrentEpisode.seriesId, iEid = oCurrentEpisode.episodeId;
		if( !aWatchTimes[sKey][iSid] ) {
			aWatchTimes[sKey][iSid] = {};
		}
		aWatchTimes[sKey][iSid][iEid] = iSeconds;
		aWatchTimes[sKey][iSid]['lastEp'] = iEid;
		aWatchTimes[sKey]['last'] = {sid: iSid, eid: iEid};
	}

	if( sType === 'vod' ) {
		aWatchTimes[sKey] = iSeconds;
	}

	localStorage.setItem('aWatchTimes', JSON.stringify(aWatchTimes));

}


function getWatchedSeriesTimes( iXtreamId, iPlaylist ) {

	var oWatchTimesPlaylist = getWatchTimes(), sKey = iPlaylist + '|' + iXtreamId + '|series';
	if( oWatchTimesPlaylist[sKey] ) {
		return oWatchTimesPlaylist[sKey];
	}

	return false;

}


function renderXtreamInfo( oJsonInfo, iXtreamId ) {

	if( !oJsonInfo ) {
		return false;
	}

	var sHtml = '', sMetaData = '';
	if( oJsonInfo.name ) {
		sHtml += '<h2>' + oJsonInfo.name + '</h2><div class="HR"></div>';
	}

	if( oJsonInfo.cover_big ) {
		sHtml += '<img src="' + oJsonInfo.cover_big + '" alt="" />';
	} else if( oJsonInfo.cover ) {
		sHtml += '<img src="' + oJsonInfo.cover + '" alt="" />';
	}

	if( oJsonInfo.genre ) {
		sMetaData += '<span class="info-tag">' + oJsonInfo.genre + '</span>';
	}

	if( oJsonInfo.age ) {
		sMetaData += '<span class="info-tag age">' + oJsonInfo.age + '+</span>';
	}

	if( oJsonInfo.releasedate ) {
		sMetaData += '<span class="info-tag">' + oJsonInfo.releasedate + '</span>';
	} else if( oJsonInfo.release_date ) {
		sMetaData += '<span class="info-tag">' + oJsonInfo.release_date + '</span>';
	}

	// Watched time
	var iWatchedVodTime = getWatchedVodTime(iXtreamId, iCurrentPlaylistId);
	if( iWatchedVodTime && oJsonInfo.duration && oJsonInfo.duration_secs ) {
		var iWatchedPct = Math.round((parseInt(iWatchedVodTime) * 100) / parseInt(oJsonInfo.duration_secs));
		sMetaData += '<p id="xtream_duration_info"><span id="info_watch_time"><span id="watch_time_elapsed" style="width: ' + iWatchedPct + '%"></span></span><span class="icon icon-clock">' + oJsonInfo.duration + '</span></p>';
	} else if( oJsonInfo.duration && oJsonInfo.duration != '00:00:00' ) {
		sMetaData += '<p><span class="icon icon-clock">' + oJsonInfo.duration + '</span></p>';
	} /*else if( oJsonInfo.episode_run_time ) {
		//sMetaData += '<p><span class="icon icon-clock">' + oJsonInfo.episode_run_time + 'Min.</span></p>';
	}*/

	sHtml += sMetaData;

	if( oJsonInfo.description ) {
		sHtml += '<p>' + oJsonInfo.description + '</p>';
	} else if( oJsonInfo.plot ) {
		sHtml += '<p>' + oJsonInfo.plot + '</p>';
	} else {
		sHtml += '<p>' + getLang('xtreamNoContentDescription') + '</p>';
	}

	if( oJsonInfo.cast ) {
		sHtml += '<p>' + oJsonInfo.cast + '</p>';
	}

	oXtreamChannelInfo.innerHTML = '<div id="xtream_movie_info" class="custom-scrollbar">' + sHtml + '</div>';
	document.body.classList.add('xtream-info-opened');

}


function loadXtreamInfo( aCurChannel, iXtreamId ) {

	if( aCurChannel && iXtreamId ) {

		bLoadingXtreamInfo = true;

		if( aCurChannel.type === 'movie' ) {

			loadXtreamVodDetails(iXtreamId, function(oJson) {

				if( iLastLoadedXtreamInfoId !== iXtreamId ) {
					return;
				}

				if( oJson.info ) {
					renderXtreamInfo(oJson.info, iXtreamId);
					return true;
				}

				oXtreamChannelInfo.innerHTML = '<div id="xtream_movie_info"><p>' + getLang('xtreamNoContentDescription') + '</p></div>';

			}, function(oHttp) {
				oXtreamChannelInfo.innerHTML = '';
				iLastLoadedXtreamInfoId = false;
			});

		} else if( aCurChannel.type === 'series' ) {

			loadXtreamSeriesDetails(iXtreamId, function(oJson) {

				if( iLastLoadedXtreamInfoId !== iXtreamId ) {
					return;
				}

				if( bSeriesSelectorOpened ) {
					showXstreamSeriesSelector();
					getEl('series_selector').classList.remove('loading-series');
				}

				if( oJson.info ) {
					//renderXtreamInfo(oJson.info, iXtreamId);
					return true;
				}

				oXtreamChannelInfo.innerHTML = '<div id="xtream_movie_info"><p>' + getLang('xtreamNoContentDescription') + '</p></div>';

			}, function(oHttp) {
				oXtreamChannelInfo.innerHTML = '';
				iLastLoadedXtreamInfoId = false;
				oXtreamSeriesInfoCache = false;
			});

		}

	}

}


var oXtreamRequest = false;
function loadXtreamVodDetails( iXtreamId, sOnSuccess, sOnFailure ) {

	if( oCurrentPlaylist && oCurrentPlaylist.type === 'xtream' && iXtreamId ) {
		var sServerUrl = oCurrentPlaylist.server, sLogin = oCurrentPlaylist.xtreamUser, sPw = oCurrentPlaylist.xtreamPw;
		var sAuthUrl = sServerUrl + 'player_api.php?username=' + sLogin + '&password=' + sPw;
		var sUrl = sAuthUrl + '&action=get_vod_info&vod_id=' + iXtreamId;

		try {
			if( oXtreamRequest ) {
				oXtreamRequest.abort();
				oXtreamRequest = false;
			}
		} catch( e ) { debugError(e) };

		iLastLoadedXtreamInfoId = iXtreamId;
		oXtreamRequest = fireRequest(sUrl, function(oHttp) {
			oXtreamRequest = false;
			var oJson = JSON.parse(oHttp.responseText);
			if( oJson ) {
				sOnSuccess(oJson);
			} else {
				sOnFailure(oHttp);
			}
		}, function(oHttp) {
			oXtreamRequest = false;
			sOnFailure(oHttp);
		});

	}

}


function loadXtreamSeriesDetails( iXtreamId, sOnSuccess, sOnFailure ) {

	if( oCurrentPlaylist && oCurrentPlaylist.type === 'xtream' && iXtreamId ) {
		var sServerUrl = oCurrentPlaylist.server, sLogin = oCurrentPlaylist.xtreamUser, sPw = oCurrentPlaylist.xtreamPw;
		var sAuthUrl = sServerUrl + 'player_api.php?username=' + sLogin + '&password=' + sPw;
		var sUrl = sAuthUrl + '&action=get_series_info&series_id=' + iXtreamId;

		if( bLoadingXtreamInfo && bSeriesSelectorOpened && iLastLoadedXtreamInfoId === iXtreamId ) {
			return true;
		}

		if( oXtreamSeriesInfoCache && iLastLoadedXtreamInfoId === iXtreamId ) {
			sOnSuccess(oXtreamSeriesInfoCache);
			bLoadingXtreamInfo = false;
			return true;
		}

		try {
			if( oXtreamRequest ) {
				oXtreamRequest.abort();
				oXtreamRequest = false;
			}
		} catch( e ) { debugError(e) };

		iLastLoadedXtreamInfoId = iXtreamId;
		oXtreamRequest = fireRequest(sUrl, function(oHttp) {
			oXtreamRequest = false;
			bLoadingXtreamInfo = false;
			var oJson = JSON.parse(oHttp.responseText);
			if( oJson && oHttp.responseText !== '[]' ) {
				if( !oJson.info ) {
					return sOnFailure(oHttp);
				}

				if( iLastLoadedXtreamInfoId === false || iLastLoadedXtreamInfoId === iXtreamId ) {
					oXtreamSeriesInfoCache = oJson;
				}

				//renderXtreamInfo(oJson.info, iXtreamId);
				sOnSuccess(oJson);
			} else {
				sOnFailure(oHttp);
			}
		}, function(oHttp) {
			oXtreamRequest = false;
			bLoadingXtreamInfo = false;
			sOnFailure(oHttp);
		});

	}

}


function loadXtreamSeriesUrl() {

	if( oCurrentPlaylist && oCurrentPlaylist.type === 'xtream' && aCurrentChannel.x_series_id ) {

		hideLoader();
		hideChannelName();

		getEl('series_selector').classList.add('active', 'loading-series');
		oEpisodesTiles.classList.add('focused');
		bSeriesSelectorOpened = 1;
		//iLastLoadedXtreamInfoId = aCurrentChannel.x_series_id;

		loadXtreamSeriesDetails(aCurrentChannel.x_series_id, function(oJson) {
			showXstreamSeriesSelector();
			getEl('series_selector').classList.remove('loading-series');
		}, function(oHttp) {
			if( !oHttp.userAborted ) {
				showModal('Could not load series');
			}
			hideSeriesSelector();
		});

		return true;

	}

	setSeriesPlayStatus(false);
	return false;

}


function changeActiveSeason( iNum ) {
	iNum = parseInt(iNum);
	if( aSeriesEpisodes && aSeriesEpisodes[iNum] ) {
		showXstreamSeriesSelector(iNum);
		//focusSeriesSelector(false);
		return true;
	}
	return false;
}


function setSeriesPlayStatus( bPlaying ) {
	bSeriesPlaying = bPlaying; // needed to allow loadChannel() fire again
	document.body.classList.toggle('series-playing', bSeriesPlaying);
}


function playEpisode( oNavItem ) {

	var iSid = oNavItem.dataset.sid, iEid = oNavItem.dataset.eid;
	if( aSeriesEpisodes && aSeriesEpisodes[iSid] && aSeriesEpisodes[iSid][iEid] ) {

		if( !isPremiumAccessAllowed() ) {
			openPremiumHint();
			return false;
		}

		var oEp = aSeriesEpisodes[iSid][iEid];
		var sServerUrl = oCurrentPlaylist.server, sLogin = oCurrentPlaylist.xtreamUser, sPw = oCurrentPlaylist.xtreamPw;
		var sAuthUrl = sServerUrl + 'player_api.php?username=' + sLogin + '&password=' + sPw;
		var sUrl = sServerUrl + 'series/' + sLogin + '/' + sPw + '/' + oEp.id;

		oCurrentEpisode = oEp;
		oCurrentEpisode.seriesId = iSid;
		oCurrentEpisode.episodeId = iEid;

		if( oEp.container_extension ) {
			sUrl += '.' + oEp.container_extension;
		}

		sPlayingUrl = sUrl;
		setVideoEngine();
		playChannelUrl();

		if( oNavItem.dataset.timepos ) {
			jumpToTime(oNavItem.dataset.timepos);
		}

		// Set EPG data
		loadChannelEpg();

		hideSeriesSelector();
		showChannelName();

		return true;

	}

	return false;

}


function moveNextEpisode( iForceEpisode ) {

	if( !aSeriesEpisodes[iActiveSeason] ) {
		return;
	}

	iActiveEpisode++;

	if( iForceEpisode !== false ) {
		if( aSeriesEpisodes[iActiveSeason][iForceEpisode] ) {
			iActiveEpisode = iForceEpisode;
		} else {
			return;
		}
	}

	if( aSeriesEpisodes[iActiveSeason][iActiveEpisode] ) {
		loadEpisodeDescription();
	} else {
		iActiveEpisode--;
	}

}


function movePrevEpisode() {

	iActiveEpisode--;

	if( aSeriesEpisodes[iActiveSeason] && aSeriesEpisodes[iActiveSeason][iActiveEpisode] ) {
		loadEpisodeDescription();
	} else {
		iActiveEpisode++;
	}

}


function moveNextSeason() {

	var iSeason = iActiveSeason + 1;
	if( aSeriesEpisodes && aSeriesEpisodes[iSeason] ) {
		changeActiveSeason(iSeason);
	}

}


function movePrevSeason() {

	var iSeason = iActiveSeason - 1;
	if( aSeriesEpisodes && aSeriesEpisodes[iSeason] ) {
		changeActiveSeason(iSeason);
	}

}


function focusSeriesSelector( bFocus ) {

	if( oSeasonTiles ) {
		oSeasonTiles.classList.toggle('focused', bFocus);
		oEpisodesTiles.classList.toggle('focused', !bFocus);
		bSeriesSelectorOpened = bFocus ? 2 : 1; // 2 = select box focused
		return false;
	}

	bSeriesSelectorOpened = 1;

}


function selectEpisode() {

	if( aSeriesEpisodes[iActiveSeason] && aSeriesEpisodes[iActiveSeason][iActiveEpisode] ) {
		var oEpisode = aSeriesEpisodes[iActiveSeason][iActiveEpisode];
		if( oEpisode.refEl ) {
			playEpisode(oEpisode.refEl);
		}
	}

}

function loadEpisodeDescription( iForceEpisode ) {

	if( aSeriesEpisodes[iActiveSeason] ) {

		if( iForceEpisode && aSeriesEpisodes[iActiveSeason][iForceEpisode] ) {
			if( iForceEpisode == iActiveEpisode ) { return false; }
			iActiveEpisode = iForceEpisode;
		}

		var oEpisode = aSeriesEpisodes[iActiveSeason][iActiveEpisode];
		if( !oEpisode ) {
			iActiveEpisode = 0;
			oEpisode = aSeriesEpisodes[iActiveSeason][iActiveEpisode];
		}

		var sHtml = '<h3>' + oEpisode.title + '</h3>', sMetaData = '';

		if( oEpisode.info.plot ) {
			sHtml += '<p>' + oEpisode.info.plot + '</p>';
		}

		if( oEpisode.info.release_date ) {
			sMetaData += '<span class="info-tag">' + oEpisode.info.release_date + '</span>';
		}

		if( oEpisode.info.rating && oEpisode.info.rating != '0' ) {
			sMetaData += '<span class="info-tag">' + rround(oEpisode.info.rating) + ' / 10</span>';
		}

		if( oEpisode.info.duration && oEpisode.info.duration != '00:00:00' ) {
			sHtml += '<p><span class="icon icon-clock">' + oEpisode.info.duration + '</span></p>';
		}

		if( sMetaData ) {
			sHtml += '<p>' + sMetaData + '<i class="CLEAR"></i></p>';
		}

		getEl('series_selector').classList.remove('loading-series');

		// Focus episode tile
		var oLastSelectedEl = oEpisodesTiles.querySelector('div.selected');
		if( oLastSelectedEl ) {
			oLastSelectedEl.classList.remove('selected');
		}

		if( oEpisode.refEl ) {
			oEpisode.refEl.classList.add('selected');
		}

		getEl('series_description').innerHTML = sHtml;

		// Focus season tile
		oLastSelectedEl = oSeasonTiles.querySelector('div.selected');
		if( oLastSelectedEl ) {
			oLastSelectedEl.classList.remove('selected');
		}

		var oNewSeason = getEl('season_tile_' + iActiveSeason);
		if( oNewSeason ) {
			oNewSeason.classList.add('selected');
		}

		if( iForceEpisode ) {
			return;
		}

		var iScrollPos = iActiveEpisode * 186 - 40;
		oSeasonTiles.style.transform = 'translateX(-' + ((iActiveSeason - 1) * 100) + 'px)';

		if( typeof(oEpisodesTiles.scrollTo) === 'function' ) {
			oEpisodesTiles.scrollTo({ top: iScrollPos, behavior: 'smooth' });
		} else {
			oEpisodesTiles.scrollTop = iScrollPos;
		}

	}

}