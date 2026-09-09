/*

var bEpgEnabled = false, bEpgDownloadRunning = false, oActiveEpgWorker = false, aCurrentProgram = {},
iCurrentProgramPos = 0, iMaxProgramCount = 0, sChannelEpgGeneratedId = false, aChannelEpgCache = [], iChannelEpgLivePos = false,
bNeedEpgUpdate = false, bEpgTableBuilt = false, aAltIds = {}, aLoadedEpgSources = {}, oEpgOverview = getEl('epg_overview'),
oEpgChannelBrowser = getEl('epg_program_browser'), oEpgChannelContent = getEl('epg'),
oNavChannelEpg = getEl('epg_nav_channel'), iEpgClockTimer = false,
oSmartEpgCurrent = getEl('smart_epg_current'), oEpgOverviewFrame = false;

var oEpgDownloadStatus = getEl('epg_download_status');

function syncScrollEpgList(oNav) {

	if( bEpgLoaded ) {
		oEpgChannelList.scrollTop = oNav.scrollTop;
	}

}


function loadEpgSourcesFromLocalStorage( sOnSuccess, sOnFailure ) {

	var sEpgSourcesStorage = localStorage.getItem('aEpgSources');
	if( sEpgSourcesStorage ) {

		try {
			aLoadedEpgSources = JSON.parse(sEpgSourcesStorage);
		} catch( e ) {
			if( typeof(sOnFailure) === 'function' ) { sOnFailure(e); }
			return false;
		}

		if( aLoadedEpgSources && typeof(aLoadedEpgSources) === 'object' ) {
			var iListCount = 0;
			for( var iId in aLoadedEpgSources ) {
				iListCount++;
			}

			if( typeof(sOnSuccess) === 'function' ) { sOnSuccess(iListCount); }
			return true;
		}

	}

	return false;

}


function loadEpgSources( sOnSuccess, sOnFailure ) {

	if( loadEpgSourcesFromLocalStorage(sOnSuccess, sOnFailure) ) {
		return;
	}

	if( bDbInitiated && oDb ) {

		var oTx = oDb.transaction("epgStore"), oStore = oTx.objectStore("epgStore"),
			oRequest = oStore.openCursor(), iListCount = 0;

		oRequest.onsuccess = function(e) {
			var oRecord = e.target.result;

			if( oRecord && oRecord.value ) {
				var oEpg = oRecord.value;

				if( !aLoadedEpgSources[oEpg.id] ) {
					aLoadedEpgSources[oEpg.id] = oEpg;
				}

				iListCount++;
			}

			if( oRecord ) { oRecord.continue(); }
		};

		oRequest.onerror = function(e) {
			if( typeof(sOnFailure) === 'function' ) { sOnFailure(e); }
		};

		oTx.oncomplete = function() {
			if( typeof(sOnSuccess) === 'function' ) { sOnSuccess(iListCount); }
		};

	}

}


function getProgramDuration( oDateStart, oDateStop ) {

	if( oDateStart && oDateStop ) {
		return oDateStop.getTime() - oDateStart.getTime();
	}

	return '';

}


function parseEpgTime( sTimeString, iOffset ) {
	var year = parseInt(sTimeString.substring(0, 4), 10);
	var month = parseInt(sTimeString.substring(4, 6), 10) - 1;
	var day = parseInt(sTimeString.substring(6, 8), 10);
	var hour = parseInt(sTimeString.substring(8, 10), 10);
	var minute = parseInt(sTimeString.substring(10, 12), 10);
	var second = parseInt(sTimeString.substring(12, 14), 10);

	// Convert timezone offset to minutes
	var offsetHours = parseInt(iOffset.substring(0, 3), 10);
	var offsetMinutes = parseInt(iOffset.substring(0, 1) + iOffset.substring(3, 5), 10); // Keeps sign

	// Convert to UTC by subtracting the offset
	return new Date(Date.UTC(year, month, day, hour, minute, second) - (offsetHours * 60 + offsetMinutes) * 60000);
}


function isEpgOutdated( sLastUpdateTime ) {

	if( sLastUpdateTime ) {
		var iGrabIntervalSetting = getEpgGrabInterval();
		var bIsOutdated = ( Date.now() - (iGrabIntervalSetting * 3600000) > parseInt(sLastUpdateTime) );
		if( !bIsOutdated ) {
			//var sLastDownloadDate = new Date(parseInt(sLastUpdateTime)).toLocaleString();
			//debug('no EPG download needed. Last download was on ' + sLastDownloadDate);
		}
		return bIsOutdated;
	}

	return true;

}


var iEpgQueueTimer = false, iQueueCount = 0;
function downloadQueuedEpgSources() {

	if( iEpgQueueTimer ) {
		clearInterval(iEpgQueueTimer);
	}

	iEpgQueueTimer = setInterval(function() {
		//debug("EpgQueueTimer");
		if( !bEpgDownloadRunning && aLoadedEpgSources ) {
			for( var i in aLoadedEpgSources ) {
				if( !bEpgDownloadRunning && aLoadedEpgSources[i].queue ) {
					downloadEpgManager(aLoadedEpgSources[i]);
					return;
				}
			}

			clearInterval(iEpgQueueTimer);
		}
	}, 2000);

}


function setEpgToQueue( oEpg, bQueue ) {

	if( oEpg.queue && bQueue ) { return false; }

	bQueue ? iQueueCount++ : iQueueCount--;

	//console.log('queue count: ' + iQueueCount);

	oEpg.queue = bQueue;
	downloadQueuedEpgSources(); // start listener for queued EPGs

}


function downloadEpgManager( oEpg ) {

	if( !oEpg ) {
		return false;
	}

	if( !getEnabledEpgSetting() ) {
		bEpgDownloadRunning = false;
		setEpgToQueue(oEpg, false);
		return false;
	}

	if( !aActiveChannelList ) {
		debug('no playlist to grab against. Please load playlist first');
		setEpgToQueue(oEpg, false);
		return false;
	}

	if( !bNeedEpgUpdate && isEpgOutdated(oEpg.grabtime) ) {
		bNeedEpgUpdate = true;
	}

	if( !bNeedEpgUpdate ) {
		//showElement('epg_activator');
		bEpgLoaded = true;
		//document.body.classList.add('epg-loaded');
		bEpgDownloadRunning = false;

		setEpgToQueue(oEpg, false);
		return false;
	}

	if( bEpgDownloadRunning ) {
		setEpgToQueue(oEpg, true);
		return false;
	}

	//document.body.classList.remove('epg-loaded');
	//oEpgDownloadStatus.innerText = getLang('epgIsDownloading') + '...';
	oEpgDownloadStatus.innerHTML = '';
	oEpgDownloadStatus.className = 'e-loading';

	if( oEpg.id && window.Worker ) {

		setEpgToQueue(oEpg, false);

		oEpg.queue = false;
		oEpg.status = 'LOADING';
		if( oEpg.error ) {
			oEpg.error = null;
		}

		if( oActiveEpgWorker ) {
			oActiveEpgWorker.terminate();
			oActiveEpgWorker = false;
		}

		bNeedEpgUpdate = false;
		bEpgDownloadRunning = true;

		var sChannelsProcessed = getLang('channels-processed'),
			sLangEpgProgramsProcessed = getLang('programs-processed'),
			sLangDownloadedBytes = getLang('downloading') + ' ';

		debug('Start epg download worker. Try grab EPG: ' + oEpg.url);

		oActiveEpgWorker = new Worker(sEpgWorkerPath);
		oActiveEpgWorker.postMessage({
			'epgHead': oEpg,
			'device': sDeviceFamily,
			'interval': getEpgGrabInterval(),
			'keepDays': AppSettings.getNumberSetting('epg-keep-days', 1),
			'futureDays': AppSettings.getNumberSetting('epg-future-days', 2),
			'descriptions': AppSettings.isActive('store-epg-desciptions'),
			'version': iDbVersion,
			'silent': true
		});

		oActiveEpgWorker.onmessage = function(e) {
			var sResponseText = e.data;
			if( sResponseText ) {

				var sStatus = getWorkerStatus(sResponseText, 'Download progress: ');
				if( sStatus ) { // progress download
					oEpgDownloadStatus.innerHTML = sLangDownloadedBytes + sStatus + ' KB';
					return true;
				}

				var sStatus = getWorkerStatus(sResponseText, 'OK channels: ');
				if( sStatus ) { // progress importing channels
					oEpg.channels = parseInt(sStatus);
					oEpgDownloadStatus.innerHTML = sChannelsProcessed + sStatus;
					return true;
				}

				sStatus = getWorkerStatus(sResponseText, 'OK programms: ');
				if( sStatus ) {
					oEpg.programs = parseInt(sStatus);
					oEpgDownloadStatus.innerHTML = sLangEpgProgramsProcessed + sStatus;
					sLoadingFromDb = false;
					return true;
				}

				// Errors
				var sStatus = getWorkerStatus(sResponseText, 'ERROR: ');
				if( sStatus  ) {
					if( sStatus === 'Not enough space' ) {
						showModal(getLang('epg-quota-exceeded-error'));
					} else {
						//showModal(sStatus, oEpg.url);
					}
					oEpg.status = 'ERROR'; oEpg.error = sStatus;
					oEpgDownloadStatus.innerHTML = '<span class="error">' + oEpg.error + '</span>';
					saveCurrentEpg(oEpg);
					abortEpgDownload();
					return true;
				}

				switch( sResponseText ) {
					case 'extracting file':
						oEpgDownloadStatus.innerHTML = getLang('extracting-file');
						break;
					case 'downloading':
						oEpgDownloadStatus.innerHTML = getLang('downloading-file');
						break;
					case 'writing':
						oEpgDownloadStatus.innerHTML = getLang('downloading');
						break;
					case 'truncating':
						oEpgDownloadStatus.innerHTML = getLang('deleting-expired');
						break;
					case 'channels complete':
						//loadChannelEpgIds(function() {
							if( bNavOpened ) {
								bEpgNavListBuilt = false;
								buildEpgNavList();
							}
							sLoadingFromDb = false;
							loadChannelEpg();
						//});

						break;
					case 'finish':
						bEpgLoaded = true;
						//document.body.classList.add('epg-loaded');
						oEpgDownloadStatus.innerHTML = '';

						oEpg.status = 'OK';
						oEpg.grabtime = Date.now();
						saveCurrentEpg(oEpg);
						epgDownLoadFinished();

						if( bNavOpened ) {
							bEpgNavListBuilt = false;
							buildEpgNavList();
						}

						sLoadingFromDb = false;
						loadChannelEpg();

						if( bEpgOverviewOpened ) {
							buildEpgOverview();
						}

						break;

				}

			}

		};

		oActiveEpgWorker.onerror = function(e) {
			oEpg.status = 'ERROR'; oEpg.error = e.message;
			oEpgDownloadStatus.innerHTML = '<span class="error">' + oEpg.error + '</span>';
			abortEpgDownload();
			saveCurrentEpg(oEpg);
		};

	} else {
		debug('Your device doesn\'t support web workers.');
		abortEpgDownload();
	}

}


function saveCurrentEpg( oEpg ) {

	if( !oEpg ) {
		return false;
	}

	if( oEpg && oEpg.url && oEpg.id ) {

		aLoadedEpgSources[oEpg.id] = oEpg;
		localStorage.setItem('aEpgSources', JSON.stringify(aLoadedEpgSources));

		/*var oTx = oDb.transaction("epgStore", "readwrite"), oAddRequest = oTx.objectStore("epgStore").put(oEpg);
		oAddRequest.onsuccess = function(oEv) {
			oEpg.id = oEv.target.result;
			if( typeof(sCallback) === 'function' ) {
				sCallback(oEpg);
			}
		};

		oAddRequest.onerror = sCallback;
		*/

	}

}


function epgItemClick( oEl, oEv ) {

	// Zoom image
	if( oEv.target.classList.contains('p-icon') ) {
		oEl.classList.toggle('p-zoom');
	} else {

		// Remove previous click-classes from other epg-items
		var oItems = document.getElementsByClassName('p-item');
		if( oItems ) {
			[].forEach.call(oItems, function(oItem) {
				if( oItem !== oEl ) {
					oItem.classList.remove('p-zoom', 'active');
				}
			});
		}

		// Open extended channel info
		if( oEl.classList.contains('short') ) {
			oEl.classList.toggle('active');
		}

	}

}


function setSmartEpg() {

	var sChannelNumberLogo = '<span class="list-ch">' + displayChannelNumber(iCurrentChannel) + '</span>';
	if( sCurrentChannelLogo ) {
		sChannelNumberLogo =  '<img src="' + getFinalUrl(sCurrentChannelLogo) + '" decoding="async" loading="lazy">' + sChannelNumberLogo;
	}

	var sOutput = sChannelNumberLogo + '<span class="list-name">' + sCurrentChannelName + '</span>';

	// Show EPG-data
	oSmartEpgCurrent.appendChild(oChannelEpg);
	if( aCurrentProgram && aCurrentProgram.id ) {
		var sLiveStatus = '';
		if( aArchiveData ) {
			sLiveStatus = 'arch'; //'<span class="arch">Archive</span> ';
		} else if( isLive() ) {
			sLiveStatus = 'live'; //'<span class="live">Live</span> ';
		}

		oSmartEpgCurrent.className = sLiveStatus;
		//oSmartEpg.classList.add('show');
	} else {
		//oSmartEpg.classList.remove('show');
	}

	var oSmartEpgChannel = getEl('smart_epg_channel');
	if( oSmartEpgChannel.innerHTML != sOutput ) {
		oSmartEpgChannel.innerHTML = sOutput;
	}

	var aCurChannel = aActiveChannelList[iCurrentChannel];
	if( aCurChannel.protect ) {
		oSmartEpgChannel.classList = 'icon icon-lock';
	} else {
		oSmartEpgChannel.classList = '';
	}

}


function createChannelEpgProgram( iPos ) {

	var oProgram = aChannelEpgCache[iPos];

	// Should be save like in epg-overview.js
	if( oProgram ) {

		if( oProgram.created ) {
			return getEl('p_pos_' + iPos);
		}

		aChannelEpgCache[iPos].created = true;

		var sProgrammHtml = '', sTags = '';

		if( oProgram.startTime ) {
			sProgrammHtml += '<p class="p-time"><b class="HR"></b>' + getTimeString(oProgram.start, {showDate: true}) + ', ' + oProgram.startTime + ' – ' + oProgram.endTime + '</p>';
		}

		if( oProgram.pic ) {
			sProgrammHtml += '<img class="p-icon" src="' + oProgram.pic + '" decoding="async" loading="lazy">';
		}

		sProgrammHtml += '<div class="p-content custom-scrollbar" style="max-height: 100%;">';

		if( oProgram.title ) {
			sProgrammHtml += '<h3 class="p-title">' + oProgram.title + '</h3>';
		}

		if( oProgram['sub-title'] ) {
			sProgrammHtml += '<h3>' + oProgram['sub-title'] + '</h3>';
		}

		if( oProgram['episode-num'] || oProgram.date ) {

			sProgrammHtml += '<p>';

			if( oProgram['episode-num'] ) {
				sProgrammHtml += '<span class="epg-program-episode">' + oProgram['episode-num'] + '</span>';
				if( oProgram.date ) { sProgrammHtml += ', '; }
			}

			if( oProgram.date ) {
				if( /^\d{8}$/.test(oProgram.date) ) {
					var year = parseInt(oProgram.date.slice(0, 4), 10), month = parseInt(oProgram.date.slice(4, 6), 10) - 1, day = parseInt(oProgram.date.slice(6, 8), 10);
					var oDate = new Date(year, month, day);
					sProgrammHtml += '<span class="epg-program-date">' + oDate.toLocaleDateString() + '</span>';
				} else {
					sProgrammHtml += '<span class="epg-program-date">' + oProgram.date + '</span>';
				}
			}

			sProgrammHtml += '</p>';

		}

		if( oProgram.desc ) {
			sProgrammHtml += '<p class="p-desc">' + oProgram.desc.replace(/\n/g, "<br>") + '</p>';
		}

		sProgrammHtml += '</div>';

		if( oProgram.subtitles ) {
			sTags += '<div class="epg-tag">' + oProgram.subtitles + '</div>';
		}

		if( oProgram.country ) {
			sTags += '<div class="epg-tag">' + oProgram.country + '</div>';
		}

		if( oProgram.rating ) {
			sTags += '<div class="epg-tag">' + oProgram.rating + '</div>';
		}

		if( oProgram.hasCatchup ) {
			sTags += '<div class="epg-tag p-arch" onclick="smartControlAction(13);"><span>Catchup</span></div>';
		}

		if( sTags ) {
			sTags = '<div class="program-tags">' + sTags + '</div>';
		}

		var oEl = document.createElement('div');
		oEl.className = 'epg-program-item';
		oEl.id = 'p_pos_' + iPos;
		oEl.dataset.channelnum = oProgram.chnum;
		oEl.innerHTML = sTags + sProgrammHtml;
		oEl.style.left = (iPos * 100) + '%';

		if( oProgram.hasCatchup ) {
			oEl.dataset.id = oProgram.id;
			oEl.dataset.catchup = sPlaylistArchiveType;
			oEl.dataset.start = oProgram.start;
			oEl.dataset.end = oProgram.stop;

			if( oProgram.xid ) {
				oEl.dataset.xid = oProgram.xid;
			}

			oEl.classList.add('p-arch');
		}

		// Channel has own defined catchup type
		if( oProgram.catchup && oProgram.catchup.type ) {
			oEl.dataset.catchup = oProgram.catchup.type;
		}

		oEpgChannelContent.appendChild(oEl);
		return oEl;

	}

	return false;

}


var bJumpNext = false;
function updateChannelNameEpg( oProgram ) {

	if( !oProgram && aChannelEpgCache ) {
		oProgram = aChannelEpgCache[iChannelEpgLivePos];
	}

	if( !oProgram ) {
		return;
	}

	var iDateNow = getTimeNow(), iStart = oProgram.startTs, iEnd = oProgram.endTs;
	if( aArchiveData !== false && iUtcArchiveStarted ) {
		iDateNow = (iUtcArchiveStarted + 1) * 1000;
	}

	var iElapsedPct = Math.round(((iDateNow - iStart) / (iEnd - iStart)) * 100);

	if( !bJumpNext && iElapsedPct >= 100 ) {
		bJumpNext = true; // prevent loop
		// Switch to next channel
		iChannelEpgLivePos++;
		updateChannelNameEpg();
	} else {
		oChannelEpg.innerHTML = '<div class="start">' + oProgram.startTime + '</div><div class="stop">' + oProgram.endTime + '</div><div id="channel_info_epg_timeline"><div id="channel_info_epg_elapsed" style="width: ' + iElapsedPct + '%"></div></div><div id="channel_info_epg_title">' + oProgram.title + '</div>';
		bJumpNext = false;
	}

}


// 1 = program available, 0 = loading, -1 not available
var iEpgLoadStatus = 0;
function setEpgLoadStatus( iStatus ) {
	iEpgLoadStatus = iStatus;

	document.body.classList.remove('has-epg', 'epg-loading', 'no-epg', 'xtream-epg');

	switch( iStatus ) {
		case -1:
			document.body.classList.add('no-epg');
			oChannelEpg.innerHTML = getLang('noEpgForChannel');
			if( bEpgDownloadRunning ) {
				oChannelEpg.innerHTML = getLang('epg-download-running');
			} else {
				oChannelEpg.innerHTML = getLang('noEpgForChannel');
			}
			break;

		case 0:
			document.body.classList.add('epg-loading');
			oChannelEpg.innerHTML = '<span class="e-loading">' + getLang('loading') + '</span>';
			break;

		case 1:
			document.body.classList.add('has-epg');
			break;

		case 2:
			document.body.classList.add('xtream-epg');
			oChannelEpg.innerHTML = '';
			break;
	}

}


function loadChannelEpgIds( sEpgId, sCallback, sErrorCallback ) {

	if( !sEpgId ) {
		sErrorCallback(false); return;
	}

	var singleKeyRange = IDBKeyRange.only(sEpgId), oRequest = oDb.transaction("epgChannels").objectStore("epgChannels").index('ch_name');

	oRequest.openCursor(singleKeyRange).onsuccess = function(event) {
		var oRecord = event.target.result;
		if( oRecord && oRecord.value ) {
			sCallback(oRecord.value.chid);
		} else {
			sErrorCallback(false);
		}
	};

	oRequest.onerror = sErrorCallback;

}


function getChannelEpgId( oChannel, sCallback ) {

	if( oChannel ) {
		if( oChannel.epgid ) {
			sCallback(oChannel.epgid); return true;
		}

		loadChannelEpgIds(oChannel.tvgid, function(sEpgId) {
			oChannel.epgid = sEpgId;
			sCallback(sEpgId);
		}, function() {
			loadChannelEpgIds(oChannel.tvgn, function(sEpgId) {
				oChannel.epgid = sEpgId;
				sCallback(sEpgId);
			}, function() {
				loadChannelEpgIds(oChannel.name, function(sEpgId) {
					oChannel.epgid = sEpgId;
					sCallback(sEpgId);
				}, function() { oChannel.epgid = false; sCallback(false); });

			});
		});

		return true;

	}

	sCallback(false); return false;

}


function loadChannelEpg( bLoadArchiveData ) {

	if( !bEpgEnabled ) { return false; }

	if( !bEpgLoaded ) {
		setEpgLoadStatus(0);

		//oSmartEpgCurrent.innerHTML = getLang('loading');
		//oEpgChannelContent.innerHTML = getLang('loading');
		return false;
	}

	if( !sLoadingFromDb ) { // Reset cache vars
		aCurrentProgram = {}; aChannelEpgCache = []; iChannelEpgLivePos = false;
		oEpgChannelContent.style.transform = 'none';
		oEpgChannelContent.innerHTML = '';
	}

	var iChNum = iCurrentChannel;
	var sEpgId = false, aCurrentEpgChannel = false;

	if( iChNum >= 0 && aActiveChannelList[iChNum] ) {
		aCurrentEpgChannel = aActiveChannelList[iChNum];
	}

	// Set Xtream series data instead of EPG
	if( oCurrentEpisode ) {

		//aChannelEpgCache.push(oProgram);
		//createChannelEpgProgram();

		var sHtml = '<h3>' + oCurrentEpisode.title + '</h3>', sMetaData = '';

		if( oCurrentEpisode.info.plot ) {
			sHtml += '<p>' + oCurrentEpisode.info.plot + '</p>';
		}

		if( oCurrentEpisode.info.release_date ) {
			sMetaData += '<span class="info-tag">' + oCurrentEpisode.info.release_date + '</span>';
		}

		if( oCurrentEpisode.info.rating && oCurrentEpisode.info.rating != '0' ) {
			sMetaData += '<span class="info-tag">' + oCurrentEpisode.info.rating + '/10</span>';
		}

		if( oCurrentEpisode.info.duration && oCurrentEpisode.info.duration != '00:00:00' ) {
			sHtml += '<p><span class="icon icon-clock">' + oCurrentEpisode.info.duration + '</span></p>';
		}

		if( sMetaData ) {
			sHtml += '<p>' + sMetaData + '<i class="CLEAR"></i></p>';
		}

		getEl('smart_xtream_info').innerHTML = sHtml;
		iChannelEpgLivePos = 1;
		setEpgLoadStatus(2);
		return;
	}

	getChannelEpgId(aCurrentEpgChannel, function(sEpgId) {

		if( !sEpgId ) {
			setEpgLoadStatus(-1);
			sLoadingFromDb = false;
			if( sSmartControlActive === 'epg' ) {
				showSmartControls('player', true);
			}
		}
		else if( sLoadingFromDb !== sEpgId && oDb ) {

			setEpgLoadStatus(0);

			aActiveChannelList[iChNum].hasEpg = true;

			aCurrentProgram = {}; aChannelEpgCache = []; iChannelEpgLivePos = false;
			sLoadingFromDb = sEpgId;
			iMaxProgramCount = 0;

			var iReferredChannel = iChNum + 1, iDateNow = getTimeNow(), iLivePos = 0, bHasLiveChannel = false;

			if( bLoadArchiveData && aArchiveData && iUtcArchiveStarted ) {
				iDateNow = (iUtcArchiveStarted + 1) * 1000;
			}

			var iCurrentTime = new Date().getTime(), oEarliestCatchupDate = false, iCatchupDays = false;
			var oStore = oDb.transaction("epgProgramme").objectStore("epgProgramme"),
				oIndex = oStore.index('id'), oRange = IDBKeyRange.only(sEpgId), oRequest = oIndex.getAll(oRange);

			/*
			var sDisplayName = aCurrentEpgChannel.name, sIconUrl = aCurrentEpgChannel.logo;
			var sEpgHtml = '<div class="epg-chno">' + iReferredChannel + '</div>';
			if( sIconUrl ) {
				sEpgHtml += '<div class="epg-icon-container"><img class="epg-icon" src="' + sIconUrl + '"></div>';
			} else if( sDisplayName ) {
				sEpgHtml = '<h2 class="epg-title">' + sDisplayName + '</h2>';
			}*/

			var oCatchup = aCurrentChannel.catchup;
			if( oCatchup ) {
				iCatchupDays = oCatchup.days;
				if( !iCatchupDays ) { iCatchupDays = 7; }
			}

			// No channel catchup available. Fallback to playlist catchup
			if( !iCatchupDays && oCurrentPlaylist.catchup && oCurrentPlaylist.catchup.days ) {
				iCatchupDays = oCurrentPlaylist.catchup.days;
			}

			if( iCatchupDays ) {
				oEarliestCatchupDate = new Date();
				oEarliestCatchupDate.subDays(iCatchupDays);
			}

			oRequest.chNum = iChNum;

			// Load programs
			oRequest.onsuccess = function(event) {

				if( this.chNum !== iCurrentChannel ) {
					console.log('abort loading EPG');
					return false; // Abort loading if channel changed
				}

				var aRecords = event.target.result;
				if( !aRecords || aRecords.length == 0 ) {
					setEpgLoadStatus(-1);
					oEpgChannelContent.style.transform = 'none';
					return;
				}

				iMaxProgramCount = aRecords.length;

				for( var i = 0; i < iMaxProgramCount; i++ ) {

					var oProgram = aRecords[i];

					// Check time
					var oStartTime = getEpgDateObject(oProgram.start), oEndTime = getEpgDateObject(oProgram.stop);
					if( !oStartTime || !oEndTime ) {
						//oRecord.continue();
						continue;
					}

					var iStart = oStartTime.getTime(), iEnd = oEndTime.getTime();

					oProgram.catchup = oCatchup;

					if( aCurrentChannel.x_stream_id ) {
						oProgram.xid = aCurrentChannel.x_stream_id;
					}

					// For catchup
					if( oEarliestCatchupDate && oStartTime > oEarliestCatchupDate && iEnd < iCurrentTime ) {
						oProgram.hasCatchup = true;
					}

					bChannelHasEpg = true;

					var sStartTime = getTimeString(oStartTime), sEndTime = getTimeString(oEndTime);

					oProgram.chnum = iChNum;
					oProgram.startTime = sStartTime;
					oProgram.endTime = sEndTime;
					oProgram.startTs = iStart;
					oProgram.endTs = iEnd;

					// Current program in channel info
					var iDuration = getProgramDuration(oStartTime, oEndTime);
					if( iStart < iDateNow && iDateNow < iEnd ) {

						iLivePos = i; iChannelEpgLivePos = iLivePos;
						var iElapsedPct = Math.round(((iDateNow - iStart) / (iEnd - iStart)) * 100);

						// Is other archive program playing now?
						if( bLoadArchiveData && aArchiveData && aArchiveData.start !== oProgram.start ) {
							aArchiveData.start = oProgram.start;
							aArchiveData.end = oProgram.stop;
							aArchiveData.originStartUtc = Math.floor(iStart / 1000);
							aArchiveData.originEndUtc = Math.floor(iEnd / 1000);
							aArchiveData.duration = iDuration / 1000;
							iArchiveCurrentTime = (iDateNow - iStart) / 1000;
							oProgram.archivePlaying = true;
						}

						oProgram.live = true;
						oProgram.duration = iDuration;
						oProgram.elapsed = iElapsedPct;
						aCurrentProgram = oProgram;
						bHasLiveChannel = true;

						updateChannelNameEpg(oProgram);

					}

					aChannelEpgCache.push(oProgram);

				}

				if( iMaxProgramCount ) {
					setEpgLoadStatus(1);
					iCurrentProgramPos = iChannelEpgLivePos;
					oEpgChannelContent.style.transform = 'translateX(' + (iCurrentProgramPos * -100) + '%)';
					createChannelEpgProgram(iCurrentProgramPos);
				}

				if( !bHasLiveChannel ) {
					setEpgLoadStatus(-1);
					oEpgChannelContent.style.transform = 'none';
				}

			};
			oRequest.oncomplete = function() {
				debug('EPG complete');
			};
			oRequest.onerror = function() {
				debug('EPG onerror');
			};

		}

	});

}


function buildEpgNavList() {

	if( !bEpgLoaded ) {
		oEpgChannelList.innerHTML = '';
		return false;
	}

	if( bEpgNavListBuilt ) {
		if( iSecondsSinceEpgNavListRefresh > 120 ) {
			refreshEpgNavList();
		}
		return true;
	}

	if( aFilteredChannelList.length === 0 ) {
		oEpgChannelList.innerHTML = '';
	} else if( oDb ) {

		var iHeight = getEl('channel_list_ul').offsetHeight;
		oEpgChannelList.innerHTML = '<ul id="epg_nav_channels" style="height: ' + iHeight + 'px"></ul>';
		syncScrollEpgList(oChannelList);

		refreshEpgNavList();
		bEpgNavListBuilt = true;
	}

}


function loadEpgNavChannel( iChNum ) {

	//var sEpgId = getChannelEpgId(aActiveChannelList[iChNum]);

	getChannelEpgId(aActiveChannelList[iChNum], function(sEpgId) {

		if( !sEpgId ) {
			return false;
		}

		var oInsert = getEl('en-c' + iChNum);
		if( !oInsert ) {
			if( typeof(aFilteredChannelList[iChNum]) !== 'undefined' ) {
				oInsert = document.createElement('li');
				oInsert.id = 'en-c' + iChNum;
				oInsert.style.top = aFilteredChannelList[iChNum] * iNavChannelHeight + 'px';
			}
		}

		if( !oInsert ) {
			return false;
		}

		getEl('epg_nav_channels').appendChild(oInsert);

		var oEpgProgramContainer = document.createElement('div');
		oEpgProgramContainer.className = 'en-prog';

		var iCount = 0, iDateNow = getTimeNow();

		aActiveChannelList[iChNum].hasEpg = true;

		var oTx = oDb.transaction("epgProgramme"), oStore = oTx.objectStore("epgProgramme"),
			oIndex = oStore.index('id'), oRange = IDBKeyRange.only(sEpgId), oRequest = oIndex.getAll(oRange);

		oRequest.onsuccess = function(event) {

			var aRecords = event.target.result;
			if( !aRecords || aRecords.length == 0 ) {
				return;
			}

			var iProgramsCount = aRecords.length;

			for( var i = 0; i < iProgramsCount; i++ ) {

				var oProgram = aRecords[i], sActive = '', sTimelineWidth = '', sStatus = '';
				var oStartTime = getEpgDateObject(oProgram.start), oEndTime = getEpgDateObject(oProgram.stop);

				// expired
				if( iDateNow > oEndTime.getTime() ) {
					continue;
				}

				if( getProgramDuration(oStartTime, oEndTime) ) {

					if( oStartTime.getTime() < iDateNow ) {
						var iElapsedPct = Math.round(((iDateNow - oStartTime.getTime()) / (oEndTime.getTime() - oStartTime.getTime())) * 100);
						var iRemainingPct = Math.round(100 - iElapsedPct);

						sActive = ' p-live';
						sTimelineWidth = 'style="background-image: linear-gradient(90deg, var(--theme-dark) 0, var(--theme-moderate) ' + iElapsedPct + '%, var(--theme-dark) ' + iElapsedPct + '%)"';
					}

					// Ausgabe
					if( iEpgTimeShift ) {
						oStartTime.subHours(iEpgTimeShift);
					}
					sStatus = getTimeString(oStartTime) + ' - ';
				}
				oEpgProgramContainer.innerHTML += '<div class="p-i' + sActive + '" ' + sTimelineWidth + '><b>' + sStatus + oProgram.title + '</b></div>';

				if( !iCount ) {
					oInsert.innerHTML = '';
					oInsert.appendChild(oEpgProgramContainer);
				}

				iCount++;

				if( iCount > 1 ) {
					break;
				}

			}
		};

		oRequest.oncomplete = function() {
			debug('EPG complete');
		};
		oRequest.onerror = function() {
			debug('EPG onerror');
		};

	});

}


function loadChannelEpgCallback() {
	//oEpgChannelContent.innerHTML = '';
	//hideChannelProgramBrowser();
	//loadChannelEpg();
}


function getEpgGrabInterval() {
	return AppSettings.getNumberSetting('epg-grab-interval', 3);
}


var iGrabInterval = false;
function initGrabbingInterval() {

	if( iGrabInterval ) {
		clearInterval(iGrabInterval);
	}

	abortEpgDownload();

	var iGrabIntervalSetting = getEpgGrabInterval();
	iGrabInterval = setInterval(function() {
		startEgpGrabbing();
	}, iGrabIntervalSetting * 3600000);

}

function notCompatibleHandler() {
	showModal(getLang('epgNotCompatibleWithPlaylist'));
	//setEpgEnableSetting(false);
}


function epgDownLoadFinished() {
	oEpgDownloadStatus.className = '';
	bEpgDownloadRunning = false;
}


function abortEpgDownload() {

	if( oActiveEpgWorker ) {
		oActiveEpgWorker.terminate();
		oActiveEpgWorker = false;
	}

	epgDownLoadFinished();

}


function resetEpgData() {

	if( bDbInitiated === 'ERROR' ) {
		stopDb();
	}

	bEpgLoaded = false;
	bEpgTableBuilt = false;
	bEpgNavListBuilt = false;
	oEpgChannelList.innerHTML = '';
	oEpgOverview.innerHTML = '';
	abortEpgDownload();
	aAltIds = {};

	localStorage.removeItem('sEpgLastUpdated');

	if( iGrabInterval ) {
		clearInterval(iGrabInterval);
	}
}


function startEgpGrabbing() {

	if( !bEpgEnabled ) {
		return false;
	}

	// already in process
	if( bDownloadRunning || bEpgDownloadRunning || bIsBooting ) {
		return false;
	}

	iCurrentPlaylistId = parseInt(iCurrentPlaylistId);

	// Get EPG
	loadEpgSources(function() {

		document.body.classList.add('epg-loaded');

		if( bNavOpened ) {
			bEpgNavListBuilt = false;
			buildEpgNavList();
		}

		if( bEpgOverviewOpened ) {
			buildEpgOverview();
		}

		sLoadingFromDb = false;
		loadChannelEpg();

		// Need reload?
		if( aLoadedEpgSources ) {
			for( var i in aLoadedEpgSources ) {
				if( i === null ) { continue; }

				/*if( aLoadedEpgSources[i].pid && aLoadedEpgSources[i].pid !== iCurrentPlaylistId ) {
					continue;
				}*/

				setEpgToQueue(aLoadedEpgSources[i], true);
				//downloadEpgManager(aLoadedEpgSources[i]);
			}
		}

	});

}


function refreshEpgOverviewTable() {

	if( oEpgOverviewFrame ) {
		oEpgOverviewFrame.contentWindow.refreshEpgOverview();
	}

}


function refreshEpgNavList() {

	iSecondsSinceEpgNavListRefresh = 0;
	aLazyLoadedEpgChannels = [];
	channelScrollEvent();

}


function lazyLoadEpgNavChannel( i ) {

	if( !bEpgEnabled || !bEpgLoaded || !bNavOpened ) {
		return false;
	}

	i = parseInt(i);

	if( aLazyLoadedEpgChannels.includes(i) || !aActiveChannelList[i] ) {
		return false;
	}

	aLazyLoadedEpgChannels.push(i);

	if( typeof(aFilteredChannelList[i]) !== 'undefined' ) {
		loadEpgNavChannel(i);
	}

	return true;

}


function epgTryLoading() {
	if( window.Worker && bEpgEnabled ) {
		initGrabbingInterval();
		startEgpGrabbing();
	}
}


function epgBoot() {

	if( !bEpgEnabled ) {
		return false;
	}

	if( bEpgBooted || bDownloadRunning || bEpgDownloadRunning || bIsBooting ) {
		return false;
	}

	bEpgLoaded = true;
	bEpgBooted = true;
	epgTryLoading();

}


function buildEpgOverview() {

	if( bEpgTableBuilt ) {
		if( iSecondsSinceEpgOverviewRefresh > 120 ) {
			refreshEpgOverviewTable();
		}
		return true;
	}

	// Create iFrame of EPG overview
	oEpgOverviewFrame = document.createElement('iframe');
	oEpgOverviewFrame.id = 'epg_overview_frame';
	oEpgOverviewFrame.title = 'M3U IPTV EPG';
	oEpgOverviewFrame.src = '../epg/index.html';
	oEpgOverview.appendChild(oEpgOverviewFrame);

	oEpgOverviewFrame.focus();
	bEpgTableBuilt = true;

}


function toggleEpgOverview() {

	if( !bEpgOverviewOpened ) {
		showEpgOverview();
	} else {
		hideEpgOverview();
	}

}


function showEpgOverview() {

	if( !isPremiumAccessAllowed() ) {
		openPremiumHint();
		return false;
	}

	/*if( bEpgDownloadRunning ) {
		showModal(getLang('epg-download-running'));
		return false;
	}*/

	clearUi('epgOverview');

	if( !bEpgEnabled ) {
		openSettings('epg');
		return false;
	} else if( !bEpgLoaded && !bEpgBooted ) {
		epgBoot();
	}

	bEpgOverviewOpened = true;
	document.body.classList.add('epg-overview');

	buildEpgOverview();

	/*try {
		//oEpgOverview.scrollTop = ((iCurrentChannel - 1) * 49) - 200;
		var oLastActiveEpgCh = document.querySelector('.e-name.active');
		if( oLastActiveEpgCh ) {
			oLastActiveEpgCh.classList.remove('active');
		}
		getEl('e-n' + (iCurrentChannel - 1)).classList.add('active');
	} catch( e ) {
		debugError(e);
	}*/

}


function hideEpgOverview( bRemoveHtml ) {

	if( oEpgOverviewFrame ) {
		oEpgOverviewFrame.remove();
		oEpgOverviewFrame = null;
	}

	bEpgTableBuilt = false;
	bEpgOverviewOpened = false;
	document.body.classList.remove('epg-overview');

}

var bProgramBrowserOpened = false;
function showChannelProgramBrowser() {

	if( !bEpgEnabled || !bEpgLoaded || bProgramBrowserOpened ) {
		return false;
	}

	setSmartEpg();
	loadChannelEpg();
	bProgramBrowserOpened = true;
	document.body.classList.add('show-top-epg');
	document.body.classList.add('show-program-browser');

	return true;

}


function hideChannelProgramBrowser() {
	bProgramBrowserOpened = false;
	oEpgChannelContent.classList.remove('smooth-move');
	document.body.classList.remove('full-epg-desc', 'show-program-browser', 'show-top-epg');
}


function showTopEpg( sMode ) {

	hideChannelName();

	document.body.classList.add('show-top-epg');
	showChannelProgramBrowser();

	bEpgOpened = true;

}


setTimeout(function() {
	epgBoot();
}, sDeviceFamily === 'Browser' ? 2000 : 3000);