/*

// Controls
var bKeyboardVisible = false, bControlsOpened = false, bUiOpened = false, bPipActive = false, oVolume = false, oVolumeBar = false, bVolumeChange = false,
iVolumeVisibleTimeout = false, bMouseOpenedNav = false, bMouseOpenedEpg = false, bControlsArrowVisible = false, oProgressBar = getEl('progress'),
bMoveChannelFieldActive = false, oMoveChannelInput = false, oNavMoveChannel = false, bAdConsentOpened = false;

// Playlist
var bPlaylistsLoaded = false, bPlaylistSelectorOpened = false, sPlaylistArchiveType = false, sFilterCategory = false,
aLoadedPlaylists = {}, oCurrentPlaylist = false, oCurrentEditPlaylist = false, sPlaylistNav = '',
bSeriesSelectorOpened = false, bSeriesSelectorLoaded = false, bGroupSelectorOpened = false;

// Player
var aCurrentChannel = false, iCurrentChannel = false, sCurrentChannelName = false, sCurrentChannelGroup = false, sCurrentChannelLogo = false, sPlayingUrl = false,
iPreviousChannel = false, bChannelReady = false, bChannelWasAlreadyPlaying = false, bSmartControlsEnabled = false,
bChannelNameGenerated = false, iDownloadId = false, iChannelInputNumber = '', sSelectedGroup = false, aGroups = {}, sUserAgent = 'Mozilla/5.0 m3u-ip.tv/' + sAppVersion + ' (' + sDeviceFamily + ')',
iSelectedAudioTrack = false, iSelectedSubtitleTrack = false, iSelectedVideoTrack = false, bPlayerLoaded = false, iCurrentPlaylistId = 0, bPlaying = false,
bChannelSettingsOpened = false, sChannelSetting = false, iChannelSettingsFocusedField = 0, sFilter = false, bIsBooting = true, oClock = getEl('clock'),
aSubTitleTracks = [], aAudioTracks = [], aVideoTracks = [], bTrackInfoLoaded = false, iContextMenuEditChannel = false,
oVideoFormatSetting = getEl('video_format_setting'), bVodPaused = false, sVideoType = false, iPlayingXtreamId = false, iCurrentPlayingTime = 0,
iLastLoadedXtreamInfoId = false, oXtreamSeriesInfoCache = false, bLoadingXtreamInfo = false, iXtreamInfoLoadingTimer = false, oXtreamInfoLoader = false,

// EPG
bEpgLoaded = false, bEpgOpened = false, bEpgOverviewOpened = false, sPlaylistEpgUrl = false, bChannelHasEpg = false, bPlaylistEpgCompatible = false,
bEpgBooted = false, aLazyLoadedEpgChannels = [],

iSecondsSinceEpgOverviewRefresh = 0, iSecondsSinceEpgNavListRefresh = 0, iSecondsSinceEpgChannelRefresh = 0,
bEpgNavListBuilt = false, iEpgNavListClockTimer = false, iSelectedEpgOverviewChannel = false,

iEpgOverviewScrollMin = 0, iEpgOverviewScrollMax = 0, iLastOverviewScrollPos = 0, aLazyLoadedOverviewItems = [], iEpgOverviewItemHeight = 64,

aFavourites = false, aWatchTimes = false, iVisibleChannels = 0, iFavChannels = false, bPlaylistHasFavs = false, sSelectedFav = false,
aPlaylistHistory = false, aActiveChannelList = [], aFilteredChannelList = [], oSelectedItem = false,
iChannelNameTimer = false, iZapTimer = false, iChannelInputTimer = false, bGuideOpened = false,
iReconnectTimer = false, iReconnectTryAfter = 1000, bStreamWasInterrupted = false, iRetryChannelLoad = 0,
bChannelNameOpened = false, bChannelInputOpened = false, sChannelLoadingError = false,
bNavOpened = false, bGroupsOpened = false, bAdvancedNavOpened = false,
bProtectionUnlocked = false, bHideProtected = true,
bSubtitlesActive = false, bDebuggerActive = false, bChannelErrorOpened = false, bSearchFocused = false,
sLocalCacheFile = 'downloads/tuner-playlist.m3u', bNeedNavRefresh = false,
iNavChannelHeight = 64, aLazyLoadedChannels = [], aChannelOrder = [], bChannelEditModeActive = false, sChannelEditMode = false,

bFrameworkLoaded = false, oHlsApi = false, bHlsFrameworkLoaded = false, oHlsOptions = {}, oAvPlayer = getEl('player'),
oDashApi = false, bDashFrameworkLoaded = false, sCurrentVideoEngine = 'hls', sStreamingEngine = 'HlsDash',

// Some DOM-Elements
oSearchField = getEl('search_field'), oContextNav = getEl('context_channel_nav'), oContextHeadline = getEl('context_headline'),
oEpgChannelList = getEl('epg_nav_list'), oLoader = getEl('loader'), oNav = getEl('nav'), oGroupsNav = getEl('group_list'), oGroupsNavItems = oGroupsNav.querySelectorAll('.list-item'),
oChannelList = getEl('channel_list'), oChannelListUl = getEl('channel_list_ul'), iChannelListHeight = 0, oCurrentNav = false,
oChannelSettingsList = getEl('channel_settings_list'), oChannelSubDubSettings = getEl('channel_settings_subs'),
oXtreamChannelInfo = getEl('xtream_info_container');

var bFirstPlayStatus = 0; // 1 = video ready, 2 = interaction done

// Channel info
var oChannelInfo = getEl('channel_info'),
oChannelTrack = getEl('channel_tracking'),
oChannelName = getEl('channel_name'),
oChannelNum = getEl('channel_number'),
oChannelLogo = getEl('channel_logo'),
oChannelGroup = getEl('channel_group'),
oChannelEpg = getEl('channel_epg'),
oSmartEpg = getEl('smart_epg'),
oPrevChannel = getEl('channel_prev'),
oNextChannel = getEl('channel_next'),
oChannelNumberInput = getEl('channel_input');


// License stuff
var iTrialSecondsLeft = 0, iSecondsUntilAd = 0, bShowAd = false;


function showLoader() {
	oLoader.style.display = 'block';
}

function hideLoader() {
	oLoader.style.display = 'none';
	oLoader.classList.remove('soft');
}


function clearNavCache() {
	aLazyLoadedChannels = [];
	bNeedNavRefresh = true;
}


function showGuide() {
	showControlsGuide(sDeviceFamily);

/*
	bGuideOpened = true;
	document.body.classList.add('showguide');
	getEl('guide_content').scrollIntoView();
*/
}

function hideGuide() {
	bGuideOpened = false;
	document.body.classList.remove('showguide');
}

function showControlsGuide( sPlatForm ) {
	getEl('modal_content').style.width = '70%';
	getEl('modal_content').style.maxWidth = '1100px';
	var sGuide = '<ul id="keys_guide" class="unordered-list ALIGNLEFT" style="margin-bottom: 0">' + getLang('guideControls') + '</ul>';
	showModal(sGuide);
}


function showChannelError( sError, sErrorCode ) {
	bChannelErrorOpened = true;
	getEl('channel_error_content').innerHTML = sError + '<br><br><span class="small">' + sErrorCode + '</span>';
	showElement('channel_error');
	hideLoader();
}

function hideChannelError() {
	if( bChannelErrorOpened ) {
		bChannelErrorOpened = false;
		hideElement('channel_error');
	}
}


// Check network status
function checkNetwork() {

	if( sDeviceFamily === 'Samsung' ) {
		try{
			// Check network status
			webapis.network.addNetworkStateChangeListener(function(value) {
				if( value == webapis.network.NetworkState.GATEWAY_DISCONNECTED ) {
					// Something you want to do when network is disconnected
					showModal(getLang("connectionLost"));
					debug("GATEWAY_DISCONNECTED");
					if( bPlayerLoaded && iCurrentChannel ) {
						webapis.avplay.pause();
					}

				} else if( value == webapis.network.NetworkState.GATEWAY_CONNECTED ) {
					// Something you want to do when network is connected again
					hideModal();
					debug("GATEWAY_CONNECTED");
					if( bPlayerLoaded && iCurrentChannel ) {
						webapis.avplay.play();
					}
				}
			});
		} catch( e ) {
			debugError(e);
		}
	}

	// LG: TODO: https://itnext.io/how-to-check-network-connection-on-smarttv-webos-and-tizen-75256c67584b

}


function fireRequest( sUrl, sOnSuccess, sOnFailure ) {

	var oHttp = new XMLHttpRequest(), bFailureFired = false;
	oHttp.timeout = 600000; // 10 min timeout
	oHttp.onload = function() {
		if( !oHttp.status || oHttp.status > 399 ) {
			if( !bFailureFired ) { bFailureFired = true; sOnFailure(oHttp); }
		} else {
			sOnSuccess(oHttp);
		}
	};

	oHttp.addEventListener('error', function() {
		if( !bFailureFired ) { bFailureFired = true; sOnFailure(oHttp); }
	});
	oHttp.addEventListener('abort', function() {
		oHttp.userAborted = true;
		if( !bFailureFired ) { bFailureFired = true; sOnFailure(oHttp); }
	});
	oHttp.addEventListener('timeout', function() {
		if( !bFailureFired ) { bFailureFired = true; sOnFailure(oHttp); }
	});

	if( sUrl && typeof(sOnSuccess) === 'function' && typeof(sOnFailure) === 'function' ) {
		try {
			oHttp.open("GET", sUrl, true);
			oHttp.send();
		} catch( e ) {
			if( !bFailureFired ) { bFailureFired = true; sOnFailure(e); }
			debugError(e);
			return false;
		}
		return oHttp;
	}

	return false;

}


function setAdditionalHeaders() {

	if( !aCurrentChannel ) { return false; }

	var sChannelUserAgent = '', sChannelReferrer = '', sHeaders = '';
	if( aCurrentChannel.ref ) {
		sChannelReferrer = aCurrentChannel.ref;
	}

	if( aCurrentChannel.ua ) {
		sChannelUserAgent = aCurrentChannel.ua;
	}

	if( aCurrentChannel.headers ) {
		sHeaders = aCurrentChannel.headers;
	}

	switch( sDeviceFamily ) {
		case 'Browser':
			if( window.chrome && typeof(window.chrome.webview) === "object" ) {
				window.chrome.webview.postMessage({
					action: "setChannelCustomData",
					sUa: sUserAgent,
					sChannelUa: sChannelUserAgent,
					sChannelRef: sChannelReferrer,
					sChannelHeaders: sHeaders
				});
			}
			break;

		case 'Android':
			m3uConnector.setChannelCustomData(sChannelUserAgent, sChannelReferrer, sHeaders);
			break;
	}

}


function applyUserAgent() {

	if( !sUserAgent ) {
		return;
	}

	switch( sDeviceFamily ) {
		case 'Browser':
		case 'LG':
			if( window.chrome && typeof(window.chrome.webview) === "object" ) {
				window.chrome.webview.postMessage({
					action: "setUserAgent",
					sUa: sUserAgent
				});
			}

			break;
		case 'Samsung':
			if( typeof(webapis) === 'undefined' ) { return; }

			var sState = webapis.avplay.getState();
			if( sState === 'PLAYING' ) {
				stopVideo();
				sState = webapis.avplay.getState();
				//debug('applyUserAgent stop stream. Status: ' + sState);
			}

			if( sState === 'IDLE' ) {
				var aCurrentChannel = aActiveChannelList[iCurrentChannel];
				if( aCurrentChannel && aCurrentChannel.ua ) {
					webapis.avplay.setStreamingProperty("USER_AGENT", aCurrentChannel.ua);
				} else {
					webapis.avplay.setStreamingProperty("USER_AGENT", sUserAgent);
				}

				//debug('setStreamingProperty USER_AGENT: ' + sUserAgent);
				// This crashes app on startup
				//tizen.websetting.setUserAgentString(sUserAgent);
			}

			break;
		case 'Android':
			m3uConnector.setUserAgent(sUserAgent);
			break;
	}

}


// Settings
function applyPlayerSettings() {

	var oCameraCutoutSetting = getEl('camera_cutout_setting');
	if( oCameraCutoutSetting ) {
		var sCameraCutoutSetting = getCameraCutoutSetting();
		oCameraCutoutSetting.value = sCameraCutoutSetting;
		switchCameraCutout(sCameraCutoutSetting);
	}

	if( oVideoFormatSetting ) {
		var sVideoFormatSetting = getVideoFormatSetting();
		oVideoFormatSetting.value = sVideoFormatSetting;
		switchVideoFormat(sVideoFormatSetting);
	}

	sUserAgent = getUserAgentSetting();
	applyUserAgent();

	if( sDeviceFamily === 'Android' && m3uConnector ) {
		m3uConnector.setPipEnabled(AppSettings.isActive('pip'));
		m3uConnector.setLandscapeOrientation(AppSettings.isActive('landscape-orientation'));
		m3uConnector.setSkipStepsSize(AppSettings.getNumberSetting('skip-step-size', 30));
	}

	sProtectionPassword = AppSettings.getSetting('password-groups');
	bEpgEnabled = AppSettings.isActive('epg-enabled');
	bSmartControlsEnabled = AppSettings.isActive('enable-smart-controls');
	bHideProtected = AppSettings.isActive('hide-protected-channels');

	if( localStorage.getItem('channelProtection') ) {
		toggleProtectionLock(true);
	}

	if( AppSettings.isActive('compact-channel-info') ) {
		document.body.classList.add('compact-channel-info');
	}

	//checkPremiumState();

	if( AppSettings.isActive('unlock-ads-premium') ) {
		if( sDeviceFamily === 'Android' ) {
			m3uConnector.checkAdsConsent();
		}
	}

}


// First init function
function boot() {

	checkNetwork();

	initControls();

	initDb(function() { // DB successfully loaded, load playlists next

		showLoader();

		iCurrentPlaylistId = localStorage.getItem('iCurrentPlaylistId');
		if( !iCurrentPlaylistId ) { iCurrentPlaylistId = 0; }
		iCurrentPlaylistId = parseInt(iCurrentPlaylistId);

		applyPlayerSettings();

		var bIsPremiumLicense = (getLicenseType() === 'Premium');
		checkAdsPremium();
		/*if( !bIsPremiumLicense && bAdsPremiumActive ) {
			prepareAd();
		}*/

		bootPlaylistReady(function(sPlaylistId, aActiveChannelList) { // has playlist - play channel
			playlistReadyHandler(); // <- initPlayer()
			if( !bDownloadRunning ) {
				setTimeout(epgBoot, 1000);
			}

			localStorage.removeItem('coming-from-settings');
			document.body.classList.remove('booting');
			bBootComplete = true;
		}, function() { // no playlist yet, show settings
			//document.body.classList.remove('booting');
			openSettings();
		});

	}, function() { // DB failure

	});


	/*
	// no settings in storage yet
	if( !bPlaylistsLoaded ) {

		console.log("playlist not loaded yet");
		if( oInputCustomUserAgent ) {
			oInputCustomUserAgent.value = sUserAgent;
		}

		openSettings(true);
		return false;
	}


	// no settings in storage yet
	var sM3uList = getPlaylist();

	// Only load valid playlist
	oInputM3u.value = sM3uList;

	loadSettings();

	var oSetting = getEl('reload_playlist_setting');
	if( oSetting && getReloadPlaylistSetting() == '1' ) {
		oSetting.checked = true;
		// Reload playlist
		if( sM3uList && sM3uList.indexOf('USB://') !== 0 && sM3uList.indexOf('local://') !== 0 ) {
			debug('reload playlist: ' + sM3uList);
			downloadPlaylistManager(sM3uList, playlistReadyHandler, function() {
				loadAndPlayFromCache();
			});
			return false;
		}
	}

	// m3u file was already downloaded, use it
	loadAndPlayFromCache();
	*/

}


function setPreferredTrackLanguage() {

	switch( sDeviceFamily ) {
		case 'LG':
			break;
		case 'Samsung':
			break;
		case 'Apple':
			break;
		case 'Android':
			m3uConnector.setPreferredTrackLanguage(getLangId());
			break;
		default:

	}

}


function getClearKeyJsonKeys( sDrmKeyString ) {

	var aClearkeys = {};

	if( sDrmKeyString.indexOf("{") === 0 ) {
		var oParsed = JSON.parse(sDrmKeyString);
		if( oParsed.keys ) {
			oParsed.keys.forEach(function(sKey) {
				aClearkeys[sKey.kid] = sKey.k;
			});
		} else {
			// Multi HEX
			for( var sItemKey in oParsed ) {
				var sKid = hexToBase64(sItemKey), sKey = hexToBase64(oParsed[sItemKey]);
				aClearkeys[sKid] = sKey;
				break;
			}
		}
	} else if( sDrmKeyString.length == 65 && sDrmKeyString.indexOf(":") == 32 ) {
		var aKeyParts = sDrmKeyString.split(":");
		var sKid = hexToBase64(aKeyParts[0]), sKey = hexToBase64(aKeyParts[1]);
		aClearkeys[sKid] = sKey;
	}

	//console.log(aClearkeys);

	return aClearkeys;

}


function setDrmHandler() {

	if( !aCurrentChannel ) { return false; }

	switch( sDeviceFamily ) {
		case 'Browser':
		case 'LG':
			if( sCurrentVideoEngine === 'dash' ) {
				if( !bDashFrameworkLoaded ) {
					loadDashFramework();
				}
				//oDashApi.setProtectionData({});
				//oDashApi.getProtectionController().setRobustnessLevel('SW_SECURE_CRYPTO');
			}

			if( aCurrentChannel.drmT && aCurrentChannel.drmK ) {

				oHlsApi.config.emeEnabled = true;
				switch( aCurrentChannel.drmT ) {
					case 'com.widevine.alpha':
					case 'widevine':
						if( sCurrentVideoEngine === 'dash' && oDashApi ) {
							oDashApi.setProtectionData({
								"com.widevine.alpha": {
									"serverURL": aCurrentChannel.drmK,
									"priority": 1
								}
							});
							return;
						}

						oHlsApi.config.drmSystems = {
							'com.widevine.alpha': {
								licenseUrl: aCurrentChannel.drmK
							}
						}
						break;
					case 'com.microsoft.playready':
					case 'playready':
						if( sCurrentVideoEngine === 'dash' && oDashApi ) {
							oDashApi.setProtectionData({
								"com.microsoft.playready": {
									"serverURL": aCurrentChannel.drmK,
									"priority": 1
								}
							});
							return;
						}

						oHlsApi.config.drmSystems = {
							'com.microsoft.playready': {
								licenseUrl: aCurrentChannel.drmK
							}
						}
						break;
					case 'com.apple.fps':
					case 'fairplay':
						oHlsApi.config.drmSystems = {
							'com.apple.fps': {
								licenseUrl: aCurrentChannel.drmK
								//serverCertificateUrl: serverCertificateUrl
							}
						}
						break;
					case 'org.w3.clearkey':
					case 'clearkey':
						if( sCurrentVideoEngine === 'dash' && oDashApi ) {
							if( aCurrentChannel.drmK.indexOf("http") === 0 ) {
								oDashApi.setProtectionData({
									"org.w3.clearkey": {
										"serverURL": aCurrentChannel.drmK,
										"priority": 1
									}
								});
							} else {
								oDashApi.setProtectionData({
									"org.w3.clearkey": {
										"clearkeys": getClearKeyJsonKeys(aCurrentChannel.drmK),
										"priority": 1
									}
								});
							}

							return;

						}

						oHlsApi.config.drmSystems = {
							'org.w3.clearkey': {
								licenseUrl: aCurrentChannel.drmK
							}
						}
						break;
				}

				return {};

			}

			if( oHlsApi ) {
				oHlsApi.config.emeEnabled = false;
				oHlsApi.config.drmSystems = {};
			}

			break;
		case 'Samsung':
			// https://developer.samsung.com/smarttv/develop/api-references/samsung-product-api-references/avplay-api.html#AVPlayManager-setDrm
			if( webapis.avplay.getState() === 'IDLE' && aCurrentChannel.drmT && aCurrentChannel.drmK ) {
				switch( aCurrentChannel.drmT ) {
					case 'com.widevine.alpha':
					case 'widevine':
						var aDrmParam = {
							AppSession: sDrmSessionId,
							LicenseServer: aCurrentChannel.drmK
						};
						webapis.avplay.setDrm("WIDEVINE_CDM", "SetProperties", JSON.stringify(aDrmParam));
						break;
					case 'com.microsoft.playready':
					case 'playready':
						var aDrmParam = {
							DeleteLicenseAfterUse: true,
							GetChallenge: true
							//UserAgent: sUserAgent,
							//CustomData: "love ya"
							//LicenseServer: aCurrentChannel.drmK
						};
						webapis.avplay.setDrm("PLAYREADY", "SetProperties", JSON.stringify(aDrmParam));
						break;
					case 'com.apple.fps':
					case 'fairplay':
						break;
					case 'org.w3.clearkey':
					case 'clearkey':
						break;
				}
			}
			break;
		case 'Android':
			if( aCurrentChannel.drmT ) {
				m3uConnector.setDrmLicense(aCurrentChannel.drmT, aCurrentChannel.drmK);
			} else {
				m3uConnector.setDrmLicense('-', '-');
			}
			break;
	}

	return {};

}


var bMediaSessionSet = false;
function setMediaSession() {

	if( typeof(navigator.mediaSession) === 'object' ) {
		var oMetadata = {
			title: aCurrentChannel.name,
			album: oCurrentPlaylist.name
		};

		if( aCurrentChannel.group ) {
			oMetadata.artist = aCurrentChannel.group;
		}

		if( aCurrentChannel.logo ) {
			oMetadata.artwork = [{src: getFinalUrl(aCurrentChannel.logo)}];
		}

		navigator.mediaSession.metadata = new MediaMetadata(oMetadata);

		if( !bMediaSessionSet ) {
			bMediaSessionSet = true;
			try {
				navigator.mediaSession.setActionHandler('play', togglePlayState);
				navigator.mediaSession.setActionHandler('pause', togglePlayState);
				navigator.mediaSession.setActionHandler('previoustrack', channelDown);
				navigator.mediaSession.setActionHandler('nexttrack', channelUp);
				navigator.mediaSession.setActionHandler('stop', stopVideo);
			} catch( e ) {}
		}
	}

}


function resetPlayer() {

	try {
		switch( sDeviceFamily ) {
			case 'Browser':
			case 'LG':
				if( sCurrentVideoEngine === 'dash' && oDashApi ) {
					oDashApi.attachSource(null);
				} else if( oHlsApi ) {
					//oHlsApi.destroy();
					oHlsApi.stopLoad();
					oHlsApi.detachMedia();
					//oPlayerEngine.reset();
				}
				break;
			case 'Samsung':
				stopVideo();
				getEl('subtitles').innerHTML = '';
				break;
			case 'Android':
			case 'Apple':
				m3uConnector.resetPlayer();
				break;

		}
	} catch( e ) {
		debugError(e);
	}

}


function stopStream() {

	bChannelReady = false;

	switch( sDeviceFamily ) {
		case 'Browser':
		case 'LG':
			if( sCurrentVideoEngine === 'html' ) {
				oAvPlayer.src = ''; oAvPlayer.removeAttribute("src");
			} else if( sCurrentVideoEngine === 'dash' && oDashApi ) {
				oDashApi.attachSource(null);
			} else if( oHlsApi ) {
				oHlsApi.stopLoad();
				oHlsApi.detachMedia();
			}
			break;
		case 'Samsung':
			//stopVideo();
			webapis.avplay.close();
			getEl('subtitles').innerHTML = '';
			break;
		case 'Android':
			if( bPlaying ) {
				m3uConnector.stopVideo();
			}
			break;
		case 'Apple':
			break;
	}

	bPlaying = false;

}


function playDashVideo( sUrl ) {

	if( !sUrl ) {
		return false;
	}

	if( !bDashFrameworkLoaded ) {
		loadDashFramework();
	}

	if( oDashApi ) {
		oDashApi.attachView(oAvPlayer);
		oDashApi.attachSource(sUrl);
		oDashApi.updateSettings({streaming: {text: {defaultEnabled: bSubtitlesActive}}});
	}

}


function playHlsVideo( sUrl ) {

	if( !sUrl ) {
		return false;
	}

	if( !bHlsFrameworkLoaded ) {
		loadHlsFramework();
	}

	if( oHlsApi ) {
		//oAvPlayer.src = sUrl;
		oHlsApi.attachMedia(oAvPlayer);
		oHlsApi.loadSource(sUrl);
		oHlsApi.subtitleDisplay = bSubtitlesActive;
		if( !bFirstPlayStatus && bChannelReady ) {
			oAvPlayer.play().catch(function() {});
		}
	} else if( oAvPlayer.canPlayType('application/vnd.apple.mpegurl') ) {
		oAvPlayer.src = sUrl;
	}

}


// Catchup / Archive
var iArchiveCurrentTime = 0, iUtcArchiveStarted = 0, aArchiveData = false;
function setArchiveData() {

}


function pad(num) {
	var s = String(num);
	while ( s.length < 2 ) s = '0' + s;
	return s;
}


function formatDate(date, format) {
	return format
	.replace(/yyyy/g, date.getFullYear())
	.replace(/YYYY/g, date.getFullYear())
	.replace(/MM/g, pad(date.getMonth() + 1))
	.replace(/dd/g, pad(date.getDate()))
	.replace(/HH/g, pad(date.getHours()))
	.replace(/mm/g, pad(date.getMinutes()))
	.replace(/ss/g, pad(date.getSeconds()))
	.replace(/Y/g, date.getFullYear())
	.replace(/m/g, pad(date.getMonth() + 1))
	.replace(/d/g, pad(date.getDate()))
	.replace(/H/g, pad(date.getHours()))
	.replace(/M/g, pad(date.getMinutes()))
	.replace(/S/g, pad(date.getSeconds()));
}


function addFlussonicArchiveTime( sUrl, startTimestamp, durationSeconds, sCatchupType ) {

	var sExt = 'm3u8'; // flussonic, flussonic-hls
	if( sCatchupType === 'flussonic-ts' || sCatchupType === 'fs' ) {
		sExt = 'ts';
	} else if( sCatchupType === 'flussonic-dash' ) {
		sExt = 'mpd';
	}

	var oUrl = new URL(sUrl), iLastSlash = oUrl.pathname.lastIndexOf('/');
	if( iLastSlash === -1 ) { return sUrl; }

	oUrl.pathname = oUrl.pathname.substring(0, iLastSlash + 1) + 'archive-' + startTimestamp + '-' + durationSeconds + '.' + sExt;

	return oUrl.toString();

}


function loadArchiveChannel( aData, iUtcStart ) {

	// Check license
	if( !isPremiumAccessAllowed() ) {
		showModal(getLang('license-archive-play-fail'));
		return false;
	}

	var oStartTime = getEpgDateObject(aData.start), iUtcBegin = Math.floor(oStartTime.getTime() / 1000);
	var oUtcNow = new Date(), iUtcNow = Math.floor(oUtcNow.getTime() / 1000);
	var oEndTime = getEpgDateObject(aData.end), iUtcEnd = Math.floor(oEndTime.getTime() / 1000);

	if( !iUtcStart ) {
		iUtcStart = iUtcBegin;
		iArchiveCurrentTime = 0;
	}

	iUtcStart = Math.floor(iUtcStart);
	var sForceUrl = false, sParams = '', iCh = aData.channelnum, iDuration = Math.floor(iUtcEnd - iUtcBegin);

	iUtcArchiveStarted = iUtcStart;

	switch( aData.catchup ) {
		case 'shift': // ?utc=1738923365&lutc=1739038922
			sParams = 'utc=' + iUtcStart + '&lutc=' + iUtcNow; break;
		case 'archive': // ?archive=startUnix&archive_end=toUnix
			sParams = 'archive=' + iUtcStart + '&archive_end=' + iUtcEnd; break;
		case 'timeshift': // ?timeshift=startUnix&timenow=nowUnix
			sParams = 'timeshift=' + iUtcStart + '&timenow=' + iUtcNow; break;

		// HLS
		case 'flussonic':
		case 'flussonic-hls':
		// MPEG-TS
		case 'flussonic-ts':
		case 'fs':
		// MPEG-DASH
		case 'flussonic-dash':
			var sChUrl = aActiveChannelList[iCh].url;
			if( sChUrl ) {
				var sUrl = addFlussonicArchiveTime(sChUrl, iUtcStart, Math.floor(iDuration), aData.catchup);
				if( sUrl && sUrl != sChUrl ) {
					sParams = sUrl; sForceUrl = sUrl;
				}
			}
			break;
		case 'xc':
			if( oCurrentPlaylist && oCurrentPlaylist.type === 'xtream' && aData.xid ) {
				sParams = oCurrentPlaylist.server + 'streaming/timeshift.php?username=' + oCurrentPlaylist.xtreamUser + '&password=' + oCurrentPlaylist.xtreamPw +
					'&stream=' + aData.xid + '&start=' + formatDate(oStartTime, 'Y-m-d:H-M') + '&duration=' + (iDuration / 60);
				sForceUrl = sParams;
			}
			break;
		case 'default':
		case 'append':
		case 'vod':
			var aCurrentChannel = aActiveChannelList[iCh], oChannelCatchup = aCurrentChannel.catchup;
			if( oChannelCatchup && oChannelCatchup.source ) {
				sParams = oChannelCatchup.source;

				try {
					sParams = sParams.replace(/^[?&]/, '');
					var aReplacements = {
						'{Y}': oStartTime.getFullYear(),
						'{m}': pad(oStartTime.getMonth() + 1), // Months are 0-based
						'{d}': pad(oStartTime.getDate()),
						'{H}': pad(oStartTime.getHours()),
						'{M}': pad(oStartTime.getMinutes()),
						'{S}': pad(oStartTime.getSeconds()),
						'{utc}': iUtcStart, '${start}': iUtcStart,
						'{lutc}': iUtcNow, '${now}': iUtcNow, '${timestamp}': iUtcNow,
						'{utcend}': iUtcEnd, '${end}': iUtcEnd,
						'${duration}': iDuration, '{duration}': iDuration
					};

					if( sParams.indexOf('yyyyMMddHHmmss') !== -1 ) {
						aReplacements['${(b)yyyyMMddHHmmss}'] = formatDate(oStartTime, 'yyyyMMddHHmmss');
						aReplacements['${(e)yyyyMMddHHmmss}'] = formatDate(oEndTime, 'yyyyMMddHHmmss');
					} else if( sParams.indexOf('YmdHMS') !== -1 ) {
						aReplacements['${start:YmdHMS}'] = formatDate(oStartTime, 'YmdHMS');
						aReplacements['${end:YmdHMS}'] = formatDate(oEndTime, 'YmdHMS');
						aReplacements['{utc:YmdHMS}'] = formatDate(oStartTime, 'YmdHMS');
						aReplacements['{lutc:YmdHMS}'] = formatDate(oUtcNow, 'YmdHMS');
						aReplacements['{utcend:YmdHMS}'] = formatDate(oEndTime, 'YmdHMS');
					} else if( sParams.indexOf('YmdHM') !== -1 ) {
						aReplacements['${start:YmdHM}'] = formatDate(oStartTime, 'YmdHM');
						aReplacements['${end:YmdHM}'] = formatDate(oEndTime, 'YmdHM');
						aReplacements['{utc:YmdHM}'] = formatDate(oStartTime, 'YmdHM');
						aReplacements['{lutc:YmdHM}'] = formatDate(oUtcNow, 'YmdHM');
						aReplacements['{utcend:YmdHM}'] = formatDate(oEndTime, 'YmdHM');
					} else if( sParams.indexOf('Ymd-H-M') !== -1 ) {
						aReplacements['${start:Ymd-H-M}'] = formatDate(oStartTime, 'Ymd-H-M');
						aReplacements['${end:Ymd-H-M}'] = formatDate(oEndTime, 'Ymd-H-M');
						aReplacements['{utc:Ymd-H-M}'] = formatDate(oStartTime, 'Ymd-H-M');
						aReplacements['{lutc:Ymd-H-M}'] = formatDate(oUtcNow, 'Ymd-H-M');
						aReplacements['{utcend:Ymd-H-M}'] = formatDate(oEndTime, 'Ymd-H-M');
					}

					if( sParams.indexOf('_iso}') !== -1 ) {
						aReplacements['{start_iso}'] = oStartTime.toISOString().replace(/\.\d{3}Z$/, "Z");
						aReplacements['{end_iso}'] = oEndTime.toISOString().replace(/\.\d{3}Z$/, "Z");
						aReplacements['{now_iso}'] = oUtcNow.toISOString().replace(/\.\d{3}Z$/, "Z");
					}

					for( var i in aReplacements ) {
						sParams = sParams.replace(i, aReplacements[i]);
					}
				} catch( e ) { debugError(e); }

				if( aData.catchup === 'default' ) {
					sForceUrl = sParams;
				}

			}

	}

	aData.originStartUtc = iUtcBegin;
	aData.originEndUtc = iUtcEnd;
	aData.duration = iDuration;
	aArchiveData = aData;

	hideEpgOverview();

	if( sSmartControlActive ) {
		var oEpgElapsed = getEl('channel_info_epg_elapsed');
		if( oEpgElapsed ) {
			var iElapsedPct = Math.round( ((iUtcArchiveStarted - iUtcBegin) / iDuration) * 100);
			oEpgElapsed.style.width = iElapsedPct + '%';
		}
	}

	if( !sParams ) {
		showModal('Channel does not support archive type: ' + aData.catchup);
		return;
	}

	loadChannel(iCh, sParams, sForceUrl);

}


function jumpArchiveStream( iSeconds ) {

	if( aArchiveData ) {
		loadArchiveChannel(aArchiveData, iUtcArchiveStarted + iSeconds);
	}

}


function getChannelUrl( aCh, sArchiveParams, sForceUrl ) {

	if( aCh.type === 'series' && aCh.x_series_id ) {
		return 'XTREAM_SERIES';
	}

	var sUrl = aCh.url;

	if( typeof(sUrl) !== 'string' ) {
		return 'no url provided';
	}

	sUrl = getFinalUrl(sUrl);

	if( sArchiveParams ) {
		if( sForceUrl ) {
			return getFinalUrl(sForceUrl);
		}

		if( sUrl.indexOf('?') > 1 ) {
			sUrl += '&' + sArchiveParams;
		} else {
			sUrl += '?' + sArchiveParams;
		}
	} else {
		aArchiveData = false;
		iArchiveCurrentTime = 0;
		iUtcArchiveStarted = 0;
	}

	return sUrl;

}


function isChannelUnlocked() {

	var aFavConfiguration = getCustomFav(iCurrentPlaylistId, iSelectedFavId);
	var aGroupConfiguration = getCustomGroup(iCurrentPlaylistId, sCurrentChannelGroup);
	oProtectedGroup = false; oProtectedFavGroup = false;

	if( aFavConfiguration && aFavConfiguration.custom_password ) {
		oProtectedFavGroup = aFavConfiguration;
		hideLoader();
		showProtectionInput('channelload');
		return false;
	}

	if( aGroupConfiguration && aGroupConfiguration.custom_password ) {
		oProtectedGroup = aGroupConfiguration;
		hideLoader();
		showProtectionInput('channelload');
		return false;
	}

	if( aCurrentChannel.protect && !bProtectionUnlocked ) {
		hideLoader();
		showProtectionInput('channelload');
		return false;
	}

	hideProtectionInput();
	return true;

}


// ---- Player
function loadAndPlayChannelUrl() {

	bChannelWasAlreadyPlaying = false;

	if( aCurrentChannel.type === 'series' && aCurrentChannel.x_series_id ) {
		sVideoType = 'series';
		iPlayingXtreamId = aCurrentChannel.x_series_id;
	} else if( aCurrentChannel.type === 'movie' && aCurrentChannel.x_stream_id ) {
		sVideoType = 'vod';
		iPlayingXtreamId = aCurrentChannel.x_stream_id;
	} else {
		sVideoType = 'live';
		iPlayingXtreamId = false;
	}

	// Xtream
	if( aCurrentChannel.x_series_id ) {
		setSeriesPlayStatus(true);
		return loadXtreamSeriesUrl();
	}

	setSeriesPlayStatus(false);
	return playChannelUrl();

}


function playChannelUrl() {

	if( !sPlayingUrl ) { return false; }

	bChannelReady = true;
	var iBuffer = null;
	if( aCurrentChannel.buffer ) {
		iBuffer = parseInt(aCurrentChannel.buffer);
	}

	try {
		switch( sDeviceFamily ) {
			case 'Browser':
			case 'LG':
				//oHlsApi = new Hls(oHlsOptions);
				applyBufferSetting(iBuffer);
				setAdditionalHeaders();
				setDrmHandler();

				if( sCurrentVideoEngine === 'html' ) {
					oAvPlayer.src = sPlayingUrl;
					oAvPlayer.play().catch(function() {});
					localStorage.setItem('iCurrentChannel', iCurrentChannel);
				} else if( sCurrentVideoEngine === 'dash' ) {
					playDashVideo(sPlayingUrl);
				} else {
					playHlsVideo(sPlayingUrl);
				}

				setMediaSession();
				break;
			case 'Samsung':
				webapis.avplay.open(sPlayingUrl);
				try {
					//webapis.avplay.setSilentSubtitle(false);
					webapis.avplay.setDisplayRect(0, 0, 1920, 1080);
					applyUserAgent();
					applyBufferSetting(iBuffer);
					/*
					debug("setVideoStillMode");
					webapis.avplay.setVideoStillMode("true");
					*/
				} catch( e ) {
					debugError(e);
				}

				setDrmHandler();
				playVideo();
				break;
			case 'Android':
				applyBufferSetting(iBuffer);
				setAdditionalHeaders();
				setDrmHandler();
				m3uConnector.loadVideo(sPlayingUrl, displayChannelNumber(iCurrentChannel) + '. ' + sCurrentChannelName, sCurrentChannelGroup, sCurrentChannelLogo);
				bPlaying = true;
				if( getEl('playpause') ) {
					changeButtonState('playpause');
				}
				break;
		}

		if( sVideoType === 'vod' && iPlayingXtreamId ) {
			var iWatchedVodTime = getWatchedVodTime(iPlayingXtreamId, iCurrentPlaylistId);
			if( iWatchedVodTime ) {
				return jumpToTime(iWatchedVodTime);
			}
		}

		removeFlasher();

	} catch( e ) {
		debug('loadChannel. Something went wrong!!! ' + e.message);

		// Stream broke, Try restart
		if( sDeviceFamily === 'Samsung' ) {
			//showModal(webapis.avplay.getState(), e.message);
			tryReconnect();
		}
	}

	return true;

}


function setVideoEngine() {

	if( sPlayingUrl === 'XTREAM_SERIES' ) {
		return;
	}

	var sExt = getFileExtension(sPlayingUrl);
	if( sExt && ['mkv', 'mp4', 'mpeg', 'mpg', 'ts', 'avi', 'mov', 'webm', 'wmv', 'm4v', 'm4p', '3gp', 'trp', 'mts', 'dat', 'vob', 'asf', 'ogg', 'aac'].includes(sExt) ) {
		sCurrentVideoEngine = 'html'; return;
	}

	if( sExt === 'mpd' || sPlayingUrl.indexOf("type=mpd") > 3 || sPlayingUrl.indexOf("/dash/") > 0 ) {
		sCurrentVideoEngine = 'dash';
	} else if( sPlayingUrl.indexOf("extension=ts") > 3 ) {
		sCurrentVideoEngine = 'html';
	} else {
		sCurrentVideoEngine = 'hls';
	}

}


function loadChannel( iNum, sArchiveParams, sForceUrl ) {

	iNum = parseInt(iNum);
	if( iNum < 0 ) {
		return false;
	}

	if( iNum === iCurrentChannel && bPlaying && !sArchiveParams && !bSeriesPlaying ) {
		return false;
	}

	if( iReconnectTimer ) {
		clearTimeout(iReconnectTimer);
		iReconnectTimer = false;
	}

	aSubTitleTracks = []; aAudioTracks = []; aVideoTracks = []; bTrackInfoLoaded = false;
	oChannelTrack.innerHTML = '';

	sVideoType = false;
	oCurrentEpisode = false;
	getEl('channel_episode_name').innerHTML = '';
	//oXtreamChannelInfo.innerHTML = '';

	iCurrentPlayingTime = 0;
	iSelectedAudioTrack = false;
	iSelectedVideoTrack = false;
	//iSelectedSubtitleTrack = false;
	resetPlayingState();
	bChannelHasEpg = false; // Reset and set later
	oChannelInfo.className = '';

	hideChannelError();
	hideEpgOverview();
	hideChannelSettings();

	if( sDeviceFamily !== 'Android' ) {
		showLoader();
	}

	if( iNum > aActiveChannelList.length ) {
		iNum = aActiveChannelList.length;
	}

	iPreviousChannel = iCurrentChannel;
	iCurrentChannel = iNum;

	aCurrentChannel = aActiveChannelList[iCurrentChannel];
	if( !aCurrentChannel ) {
		aCurrentChannel = aActiveChannelList[0];
		iCurrentChannel = 0;
	}

	if( !aCurrentChannel ) {
		return false;
	}

	sPlayingUrl = getChannelUrl(aCurrentChannel, sArchiveParams, sForceUrl);

	sCurrentChannelName = aCurrentChannel.cname ? aCurrentChannel.cname : aCurrentChannel.name;
	sCurrentChannelGroup = aCurrentChannel.group;
	sCurrentChannelLogo = false;
	if( typeof(aCurrentChannel.logo) === 'string' ) {
		sCurrentChannelLogo = getFinalUrl(aCurrentChannel.logo);
	}

	if( sCurrentChannelGroup !== sSelectedGroup && sSelectedGroup !== '__fav' ) {
		var bFound = false;
		if( sCurrentChannelGroup && sCurrentChannelGroup.indexOf(';') > 1 ) {
			var aChannelGroups = sCurrentChannelGroup.split(';');
			aChannelGroups.forEach(function(sGr) {
				if( sSelectedGroup === sGr ) { bFound = true; }
			});
			if( !bFound ) {
				removeGroupFilter();
			}
		} else {
			removeGroupFilter();
		}
	}

	try {
		stopStream();
	} catch( e ) {
		debugError(e);
	}

	if( !sPlayingUrl ) {
		showChannelError('This channel has no URL', 'Code: NO_CHANNEL_URL');
		return false;
	}

	setVideoEngine();
	lazyLoadChannel(iCurrentChannel);

	// activate channel in nav
	var oNavChannel = getNavChannel(iCurrentChannel);
	var oLastSelectedNavItem = oChannelList.querySelector('li.selected');
	if( oLastSelectedNavItem ) {
		oLastSelectedNavItem.classList.remove('selected');
	}

	var oOldNavChannel = oChannelList.querySelector('li.active');
	if( oOldNavChannel ) {
		oOldNavChannel.classList.remove('active');
	}

	if( oNavChannel ) {
		oSelectedItem = oNavChannel;
		oNavChannel.classList.add('active', 'selected'); // can be filtered out!
		scrollToListItem(oNavChannel);
	}

	sLoadingFromDb = false;
	bChannelNameGenerated = false;

	if( typeof(loadChannelEpgCallback) === 'function' ) {
		loadChannelEpgCallback();
	}

	if( sSmartControlActive ) {
		loadChannelEpg(aArchiveData !== false);
		setSmartEpg();
	} else {
		showChannelName();
	}

	if( aCurrentChannel.protect && !bProtectionUnlocked ) {
		hideLoader();
		showProtectionInput('channelload');
		return false;
	}

	hideProtectionInput();
	bChannelWasAlreadyPlaying = false;

	if( bShowAd ) {
		showRewardedAdConsent(); return false;
	}

	return loadAndPlayChannelUrl();

}


var successLoadCallback = function() {
	//debug('The media has finished preparing');

	localStorage.setItem('iCurrentChannel', iCurrentChannel);
	//localStorage.setItem('sLastChannelName', sCurrentChannelName);
	resetPlayingState();
	bChannelWasAlreadyPlaying = true;

	//webapis.avplay.setDisplayRect(0, 0, window.innerWidth, window.innerHeight);
	//switchVideoFormat(false); // set fullscreen / original mode

	if( bChannelSettingsOpened ) {
		buildSubDubForm();
	}

	bPlayerLoaded = true;
	webapis.avplay.play();
	bPlaying = true;
};


var errorLoadCallback = function() {
	bPlayerLoaded = false;
	debug('The media has failed to prepare');
	stopVideo();

	// Try again
	/*
	if( iRetryChannelLoad < 3 ) {
		debug('errorLoadCallback. Retry channel load. Count: ' + iRetryChannelLoad);
		tryReconnect();
	}*/
};


function setCurrentTime( iSeconds ) {
	iCurrentPlayingTime = iSeconds;
}


function getCurrentPlayedTime() {

	try {
		switch( sDeviceFamily ) {
			case 'Browser':
			case 'LG':
				if( oAvPlayer ) {
					return Math.round(oAvPlayer.currentTime);
				}
				break;
			case 'Samsung':
				var sState = webapis.avplay.getState();
				if( sState === 'PLAYING' || sState === 'PAUSED' ) {
					return Math.round(webapis.avplay.getCurrentTime() / 1000);
				}
				break;
			case 'Android':
			case 'Apple':
				m3uConnector.getCurrentTime();
				return iCurrentPlayingTime;
		}
	} catch( e ) {

	}

	return 0;

}


var oFlasher = false, iFlasherTimeout = false;
function flashTime( iSeconds ) {

	if( !iSeconds ) { return; }
	var hrs = Math.floor(iSeconds / 3600), mins = Math.floor((iSeconds % 3600) / 60), secs = Math.floor(iSeconds % 60);;

	if( !oFlasher ) {
		oFlasher = document.createElement('div');
		oFlasher.id = 'time_flash';
		getEl('body').appendChild(oFlasher);
	}

	if( iFlasherTimeout ) {
		clearTimeout(iFlasherTimeout);
	}

	oFlasher.innerHTML = '<span class="icon icon-clock">' + String(hrs).padStart(2, "0") + ":" + String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0") + '</span>';
	oFlasher.className = 'flash';

	iFlasherTimeout = setTimeout(function() {
		removeFlasher();
	}, 2000);

}


function removeFlasher() {
	if( oFlasher ) {
		oFlasher.className = 'flashed';
	}
}


function openUiElement( sElement ) {

	var aUiElements = ['Nav', 'Epg', 'EpgOverview', 'ChannelName', 'ChannelSettings', 'Controls'];

	for( var i; i < aUiElements.length; i++ ) {

		if( aUiElements[i] == sElement ) {
			// show
		} else {
			// hide
		}

	}

}


function clearUi( sExclude ) {
	//if( sExclude !== 'epg' ) hideChannelEpg();
	if( sExclude !== 'epgOverview' ) hideEpgOverview();
	if( sExclude !== 'nav' ) hideNav();
	if( sExclude !== 'channelName' ) hideChannelName();
	if( sExclude !== 'channelSettings' ) hideChannelSettings();
	if( sExclude !== 'controls' ) hideControls();
	if( sExclude !== 'smartControls' ) hideSmartControls();
	if( sExclude !== 'context' ) hideContextMenu();
	//if( sExclude !== 'seriesSelector' ) hideSeriesSelector();
}


// ---- channel list
function toggleNav() {
	if( bNavOpened ) {
		showNav();
	} else {
		hideNav();
	}
}

function showNav() {

	clearUi('nav');
	bNavOpened = true;

	// Logos found in EPG functions, rebuild nav with new logos
	if( bNeedNavRefresh ) {
		bNeedNavRefresh = false;
		buildNav();
	} else {
		buildEpgNavList();
		syncScrollEpgList(oChannelList);
	}

	hideControlsArrow();

	var oSelected = getCurrentSelectedItem();
	if( oSelected ) {
		oSelected.classList.remove('selected');
	}
	selectNavChannel();
	channelScrollEvent();

	document.body.classList.add('nav-opened');

	//oSearchField.removeAttribute('disabled');

	// if no favs available remove the fav-group selection
	if( sSelectedGroup === '__fav' && !getFavsCount() ) {
		removeGroupFilter();
		buildNav();
		return false;
	}

	//oSelectedItem = getCurrentSelectedItem();

	/*
	// on channel select, show detailed EPG info
	if( oSelectedItem && oSelectedItem.dataset.channelnum ) {
		if( typeof(loadNavChannelEpgCallback) === 'function' ) {
			loadNavChannelEpgCallback(oSelectedItem.dataset.channelnum);
		}
	}
	*/

}

function hideNav() {

	if( !bChannelReady ) {
		return false;
	}

	//oSearchField.setAttribute('disabled', 'disabled');
	//oNav.style.width = '0';
	hideGroups();
	hideAdvancedNav();
	bNavOpened = false;
	bMouseOpenedNav = false;
	document.body.classList.remove('nav-opened');

	if( bMoveChannelFieldActive ) {
		hideChannelPosInput();
	}

	// Truncate nav next time it is opened if there were too many items loaded
	if( aLazyLoadedChannels.length > 200 ) {
		bNeedNavRefresh = true;
		buildNav();
	}

	return true;

}


function showGroups() {
	hideAdvancedNav();
	bGroupsOpened = true;
	bMouseOpenedNav = false;
	//oSearchField.removeAttribute('disabled');
	//oGroupsNav.style.width = iNavWidth + 'px';
	oSelectedItem = getCurrentSelectedItem();
	oSelectedItem.classList.add('selected');
	document.body.classList.add('groups-opened');
	scrollToListItem(oSelectedItem);
}

function hideGroups() {
	//oGroupsNav.style.width = '0';
	bGroupsOpened = false;
	oSelectedItem = getCurrentSelectedItem();
	document.body.classList.remove('groups-opened');
}


function showAdvancedNav() {
	hideGroups();
	bAdvancedNavOpened = true;

	oSelectedItem = getCurrentSelectedItem();
	oSelectedItem.classList.add('selected');
	document.body.classList.add('advanced-nav-opened');
	scrollToListItem(oSelectedItem);

}

function hideAdvancedNav() {
	bAdvancedNavOpened = false;
	document.body.classList.remove('advanced-nav-opened');
}


function toggleControlsSettings() {

	if( bChannelSettingsOpened ) {
		hideChannelSettings();
	} else {
		showChannelSettings();
	}

}


var bCastConnected = false;
function googleCast() {
	if( sDeviceFamily === 'Android' ) {
		if( !isPremiumAccessAllowed() ) {
			openPremiumHint();
			return false;
		}
		hideChannelSettings();
		m3uConnector.initGoogleCast();
	}
}

function castConnected() {
	bCastConnected = true;
	document.body.classList.add('cast-connected');
}

function castDisconnected() {
	bCastConnected = false;
	document.body.classList.remove('cast-connected');
}


/* Channel settings */
var iRetryTrackLoading = false;

function updateVideoTrackInfo() {
	var sInfo = ' - ' + getLang('channelSettingResolution') + ': ' + oPlayerEngine.videoWidth() + 'x' + oPlayerEngine.videoHeight();
	oChannelTrack.innerHTML = sInfo;
}


// Get audio tracks, subtitle tracks, resolution, codecs and bitrate
function loadTrackInfo() {

	if( bTrackInfoLoaded ) {
		return true;
	}

	//oChannelTrack.innerHTML = '';
	var sInfo = '';

	try {
		switch( sDeviceFamily ) {
			case 'Browser':
			case 'LG':
				// reset track info and set again
				aSubTitleTracks = []; aAudioTracks = []; aVideoTracks = [];

				if( sCurrentVideoEngine === 'dash' && oDashApi ) {

					// Subtitles
					var oTrackInfo = oDashApi.getTracksFor('text');
					if( oTrackInfo ) {
						var iTrackInfoCount = oTrackInfo.length;
						for( var i = 0; i < iTrackInfoCount; i++ ) {
							aSubTitleTracks.push({id: i, index: oTrackInfo[i].index, name: oTrackInfo[i].lang});
						}
					}

					// Audio
					var oTrackInfo = oDashApi.getTracksFor('audio');
					if( oTrackInfo ) {
						var oCurrentTrack = oDashApi.getCurrentTrackFor('audio');
						var iTrackInfoCount = oTrackInfo.length;
						for( var i = 0; i < iTrackInfoCount; i++ ) {
							if( oCurrentTrack == oTrackInfo[i] ) { iSelectedAudioTrack = i; }
							aAudioTracks.push({id: i, index: oTrackInfo[i].index, name: oTrackInfo[i].lang});
						}
					}

					// Video
					var oTrackInfo = oDashApi.getTracksFor('video');
					if( oTrackInfo ) {
						var oCurrentTrack = oDashApi.getCurrentTrackFor('video');
						var iTrackInfoCount = oTrackInfo.length;
						for( var i = 0; i < iTrackInfoCount; i++ ) {
							if( oCurrentTrack == oTrackInfo[i] ) { iSelectedVideoTrack = i; }
							var sName = oTrackInfo[i].lang;
							if( sName ) { sName += ' - ' }
							sName += oTrackInfo[i].codec;
							aVideoTracks.push({id: i, index: oTrackInfo[i].index, name: sName});
						}
					}

				} else if( sCurrentVideoEngine === 'html' ) {

					/*var oTrackInfo = oAvPlayer.textTracks;
					if( oTrackInfo ) {
						var iTrackInfoCount = oTrackInfo.length;
						for( var i = 0; i < iTrackInfoCount; i++ ) {
							aSubTitleTracks.push({id: i, name: oTrackInfo[i].language + ' - ' + oTrackInfo[i].label});
						}
					}*/

				} else if( oHlsApi ) {

					// Subtitles
					var oTrackInfo = oHlsApi.subtitleTracks;
					if( oTrackInfo ) {
						var iTrackInfoCount = oTrackInfo.length;
						for( var i = 0; i < iTrackInfoCount; i++ ) {
							aSubTitleTracks.push({id: oTrackInfo[i].id, name: oTrackInfo[i].lang + ' - ' + oTrackInfo[i].name});
						}
					}

					// Audio
					var oTrackInfo = oHlsApi.audioTracks;
					if( oTrackInfo ) {
						var iTrackInfoCount = oTrackInfo.length;
						for( var i = 0; i < iTrackInfoCount; i++ ) {
							aAudioTracks.push({id: oTrackInfo[i].id, name: oTrackInfo[i].lang + ' - ' + oTrackInfo[i].name});
						}
					}

				}

				break;

			case 'Samsung':
				if( webapis.avplay.getState() === 'IDLE' ) {
					return false;
				}

				var oTrackInfo = webapis.avplay.getTotalTrackInfo();
				if( oTrackInfo ) {
					var iTrackInfoCount = oTrackInfo.length;

					// reset track info and set again
					aSubTitleTracks = []; aAudioTracks = []; aVideoTracks = [];

					for( var i = 0; i < iTrackInfoCount; i++ ) {
						//sInfo += oTrackInfo[i].type + ': ';
						var oExtraInfo = JSON.parse(oTrackInfo[i].extra_info);
						if( oExtraInfo ) {
							if( oExtraInfo.fourCC ) {
								if( oTrackInfo[i].type === 'VIDEO' ) {
									sInfo += (sInfo ? '<br>' : '') + oExtraInfo.fourCC;
									if( oExtraInfo.Bit_rate && oExtraInfo.Bit_rate != '99999999' ) {
										var iMbits = (oExtraInfo.Bit_rate / 1000000).toFixed(3);
										sInfo += ' (' + iMbits + ' Mbit/s)';
									}
									if( oExtraInfo.Width && oExtraInfo.Height ) {
										sInfo += ' - ' + getLang('channelSettingResolution') + ': ' + oExtraInfo.Width + 'x' + oExtraInfo.Height;
									}
								} else if( i < 3 ) { // AUDIO
									sInfo += (sInfo ? '<br>' : '') + oExtraInfo.fourCC;
									if( oExtraInfo.bit_rate && oExtraInfo.bit_rate != '99999999' ) {
										var iMbits = (oExtraInfo.bit_rate / 1000000).toFixed(3);
										sInfo += ' (' + iMbits + ' Mbit/s)';
										if( oExtraInfo.language ) {
											sInfo += ' - ' + oExtraInfo.language;
										}
									}
								} else if( i === 3 ) {
									sInfo += '<br>...';
								}
							}

							switch( oTrackInfo[i].type ) {
								case 'TEXT':
									var sTrackName = oExtraInfo.track_lang;
									if( !sTrackName ) {
										sTrackName = '-- unknown --';
									}
									aSubTitleTracks.push({id: oTrackInfo[i].index, name: sTrackName});
									break;
								case 'VIDEO':
									aVideoTracks.push({id: oTrackInfo[i].index, name: oExtraInfo.fourCC});
									break;
								case 'AUDIO':
									var sName = oExtraInfo.language ? oExtraInfo.language : getLang('channelSettingAudioDefault');
									if( oExtraInfo.bit_rate ) {
										var iMbits = (oExtraInfo.bit_rate / 1000000).toFixed(3);
										sName += ' - ' + oExtraInfo.fourCC + ' (' + iMbits + ' Mbit/s)';
									}
									aAudioTracks.push({id: oTrackInfo[i].index, name: sName});
									break;
							}

						}
					}

					oChannelTrack.innerHTML = sInfo;

				}
				break;

			case 'Android':
			case 'Apple':
				// is updated in CustomPlayer: AnalyticsListener
				//var oTrackInfo = m3uConnector.getTotalTrackInfo(), sInfo = '';
				updateTrackStats();
				break;
		}

		bTrackInfoLoaded = true;

	} catch( e ) {
		debug('loadTrackInfo error: ' + e.message);
	}

	return bTrackInfoLoaded;

}


function updateTrackStats() {

	try {
		if( bChannelSettingsOpened ) {
			oChannelTrack.innerHTML = m3uConnector.getTrackStats();
		}
	} catch( e ) { }

}


function switchVideoFormat( sMode ) {

	/*
	if( sChannelSetting !== 'video' ) {
		debug('switchVideoFormat not allowed');
		return false;
	}*/

	//setVideoFormatSetting(sMode);

	if( sMode === false ) {
		sMode = getVideoFormatSetting();
	}

	try {
		switch( sDeviceFamily ) {
			case 'LG':
			case 'Browser':
				var sCss = 'contain';
				if( sMode == 'fill' ) {
					sCss = 'fill';
				} else if( sMode == 'zoom' ) {
					sCss = 'cover';
				}

				oAvPlayer.style.objectFit = sCss;
				break;
			case 'Samsung':
				if( sMode == 'fill' ) {
					webapis.avplay.setDisplayMethod("PLAYER_DISPLAY_MODE_FULL_SCREEN");
				} else if( sMode == 'letterbox' ) {
					webapis.avplay.setDisplayMethod("PLAYER_DISPLAY_MODE_LETTER_BOX");
				} else {
					webapis.avplay.setDisplayMethod("PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO");
				}
				break;
			case 'Android':
			case 'Apple':
				m3uConnector.setAspectMode(sMode);

		}
	} catch( e ) {
		debug('switchPlayerAspectMode error: ' + e.message);
	}

}


function switchCameraCutout( sValue ) {
	if( sDeviceFamily === 'Android' ) {
		m3uConnector.setCameraCutoutMode(sValue === 'on');
	}
}


function switchVideoTrack( iTrackId ) {

	if( sChannelSetting !== 'sub-dub' ) {
		debug('switchVideoTrack not allowed');
		return false;
	}

	iTrackId = parseInt(iTrackId);

	try {
		if( sCurrentVideoEngine === 'dash' && oDashApi ) {
			var oVideoTracks = oDashApi.getTracksFor('video');
			if( oVideoTracks && oVideoTracks[iTrackId] ) {
				oDashApi.setCurrentTrack(oVideoTracks[iTrackId]);
			}
		} else if( oHlsApi ) {
			//
		} else if( sDeviceFamily === 'Samsung' && aVideoTracks.length ) {
			//webapis.avplay.setSelectTrack('VIDEO', iTrackId);
		} else if( sDeviceFamily === 'Android' && aVideoTracks.length ) {
			//m3uConnector.setSelectTrack('VIDEO', iTrackId);
		}
		iSelectedVideoTrack = iTrackId;
		debug('Switched video track: ' + iTrackId);
	} catch( e ) { debugError(e); }

}


function switchAudioTrack( iTrackId ) {

	if( sChannelSetting !== 'sub-dub' ) {
		debug('switchAudioTrack not allowed');
		return false;
	}

	iTrackId = parseInt(iTrackId);

	try {
		if( sCurrentVideoEngine === 'dash' && oDashApi ) {
			var oAudioTracks = oDashApi.getTracksFor('audio');
			if( oAudioTracks && oAudioTracks[iTrackId] ) {
				oDashApi.setCurrentTrack(oAudioTracks[iTrackId]);
			}
		} else if( oHlsApi ) {
			oHlsApi.audioTrack = iTrackId;
		} else if( sDeviceFamily === 'Samsung' && aAudioTracks.length ) {
			webapis.avplay.setSelectTrack('AUDIO', iTrackId);
		} else if( sDeviceFamily === 'Android' && aAudioTracks.length ) {
			m3uConnector.setSelectTrack('AUDIO', iTrackId);
		}
		iSelectedAudioTrack = iTrackId;
		debug('Switched audio track: ' + iTrackId);
	} catch( e ) { debugError(e); }

}


function switchSubtitleTrack( iTrackId ) {

	if( sChannelSetting !== 'sub-dub' ) {
		debug('switchSubtitleTrack not allowed');
		return false;
	}

	try {
		if( iTrackId == 'OFF' ) {
			hideSubtitles();
			return false;
		}

		iTrackId = parseInt(iTrackId);

		showSubtitles();
		if( sCurrentVideoEngine === 'dash' && oDashApi ) {
			oDashApi.setTextTrack(iTrackId);
		} else if( sCurrentVideoEngine === 'html' ) {
			//oAvPlayer.textTracks[iTrackId].mode = 'showing';
		} else if( oHlsApi ) {
			oHlsApi.subtitleTrack = iTrackId;
		} else if( sDeviceFamily === 'Samsung' && aSubTitleTracks.length ) {
			webapis.avplay.setSelectTrack('TEXT', iTrackId);
		} else if( sDeviceFamily === 'Android' && aSubTitleTracks.length ) {
			m3uConnector.setSelectTrack('TEXT', iTrackId);
		}
		iSelectedSubtitleTrack = iTrackId;
		debug('Switched subtitle track: ' + iTrackId);
	} catch( e ) { debugError(e); }

}


function buildSubDubForm() {

	if( sDeviceFamily === 'Samsung' ) {
		var sState = webapis.avplay.getState();
		if( sState !== 'READY' && sState !== 'PLAYING' && sState !== 'PAUSED' && !iRetryTrackLoading ) {
			oChannelSubDubSettings.innerHTML = '<p style="margin-top: 60px;">' + getLang('loading') + '</p>';
			return false;
		}
	}

	if( sDeviceFamily === 'Android' ) {

		sHtml = '<button class="setting-button" onclick="toggleAudio();">' + getLang('audioTrack') + '</button>';
		sHtml += '<button class="setting-button" onclick="toggleSubtitles();">' + getLang('subtitleTrack') + '</button>';
		oChannelSubDubSettings.innerHTML = sHtml;

		sHtml = '<button class="setting-button" onclick="toggleVideo();">' + getLang('videoTrack') + '</button>';
		getEl('channel_settings_video_codecs').innerHTML = sHtml;

		updateTrackStats();

		return true;
	}

	loadTrackInfo();

	var sHtml = '';
	if( aAudioTracks || aSubTitleTracks ) {

		// Audio-Tracks
		sHtml += '<div class="channel-setting form-row"><label>' + getLang('audioTrack') + '</label>';
		var iCount = aAudioTracks.length;
		if( iCount > 1 ) {
			sHtml += '<select class="selection setting-button" onchange="switchAudioTrack(this.value);">';
				for( var i = 0; i < iCount; i++ ) {
					var sSelectedAttr = '';
					if( iSelectedAudioTrack == aAudioTracks[i].id ) {
						sSelectedAttr = 'selected="selected"';
					}
					sHtml += '<option value="' + aAudioTracks[i].id + '" ' + sSelectedAttr + '>' + aAudioTracks[i].name + '</option>';
				}
			sHtml += '</select>';
		} else if( iCount === 1 ) {
			sHtml += '<p class="selection">' + aAudioTracks[0].name + '</p>';
		} else {
			sHtml += '<p class="selection">' + getLang('channelSettingAudioDefault') + '</p>';
		}

		sHtml += '</div><div class="HR"></div>';

		// Subtitle-Tracks
		sHtml += '<div class="channel-setting form-row"><label>' + getLang('subtitleTrack') + '</label>';
		var iCount = aSubTitleTracks.length;
		if( iCount ) {
			sHtml += '<select class="selection setting-button" onchange="switchSubtitleTrack(this.value);">';
				sHtml += '<option value="OFF">' + getLang('channelSettingSubOff') + '</option>';
				for( var i = 0; i < iCount; i++ ) {
					var sSelectedAttr = '';
					if( bSubtitlesActive && iSelectedSubtitleTrack == aSubTitleTracks[i].id ) {
						sSelectedAttr = 'selected="selected"';
					}
					sHtml += '<option value="' + aSubTitleTracks[i].id + '" ' + sSelectedAttr + '>' + aSubTitleTracks[i].name + '</option>';
				}
			sHtml += '</select>';
		} else {
			sHtml += '<p class="selection">' + getLang('channelSettingSubNoTrack') + '</p>';
		}

		sHtml += '</div>';

	}

	oChannelSubDubSettings.innerHTML = sHtml;

	if( aVideoTracks ) {

		var iCount = aVideoTracks.length;
		if( iCount ) {
			// Video-Tracks
			sHtml = '<div class="HR"></div><div class="channel-setting form-row"><label>' + getLang('videoTrack') + '</label>';
			sHtml += '<select class="selection setting-button" onchange="switchVideoTrack(this.value);">';
				//sHtml += '<option value="OFF">' + getLang('channelSettingSubOff') + '</option>';
				for( var i = 0; i < iCount; i++ ) {
					var sSelectedAttr = '';
					if( iSelectedVideoTrack == aVideoTracks[i].id ) {
						sSelectedAttr = 'selected="selected"';
					}
					sHtml += '<option value="' + aVideoTracks[i].id + '" ' + sSelectedAttr + '>' + aVideoTracks[i].name + '</option>';
				}
			sHtml += '</select></div>';
			getEl('channel_settings_video_codecs').innerHTML = sHtml;
		}

	}


}


function showChannelSetting( sSetting ) {

	sChannelSetting = sSetting;
	iChannelSettingsFocusedField = 0;

	var sChannelSettingContainerId = false;
	switch( sSetting ) {
		case 'video':
			sChannelSettingContainerId = '#channel_settings_video';
			break;
		case 'sub-dub':
			sChannelSettingContainerId = '#channel_settings_subs';
			break;
		default:
			sChannelSettingContainerId = '#channel_settings_content';
	}

	var oSettingSelectBoxes = document.querySelectorAll(sChannelSettingContainerId + ' .setting-button');
	if( oSettingSelectBoxes && oSettingSelectBoxes.length ) {
		setTimeout(function() {
			oSettingSelectBoxes[iChannelSettingsFocusedField].focus();
		}, 50);
	}

	getEl('list_container_right').className = 'edit-' + sSetting;
	document.body.classList.add('channel-setting-edit');

}


function hideChannelSetting() {
	sChannelSetting = false;
	defocus();
	getEl('list_container_right').className = '';
	document.body.classList.remove('channel-setting-edit');
}


function showChannelSettings() {

	clearUi('channelSettings');

	if( sChannelSetting ) {
		hideChannelSetting();
	}

	if( !bChannelSettingsOpened ) {
		bChannelSettingsOpened = true;
		oSelectedItem = getCurrentSelectedItem();
		oSelectedItem.classList.add('selected');
		document.body.classList.add('channel-settings-opened');
		buildSubDubForm();
	}

}

function hideChannelSettings() {
	if( bChannelSettingsOpened ) {
		bChannelSettingsOpened = false;
		document.body.classList.remove('channel-settings-opened');
	}
	hideChannelSetting();
}


function toggleChannelEditMode( sMode ) {

	document.body.classList.remove('channel-edit', 'channel-edit-move', 'channel-edit-delete');

	if( sMode == 'exit' ) {
		sChannelEditMode = false;
		bChannelEditModeActive = false;
		showGroups();
		buildNav(true);
		// Refresh EPG-List
		iSecondsSinceEpgNavListRefresh = 9999;
		iSecondsSinceEpgOverviewRefresh = 9999;
		return false;
	}

	sChannelEditMode = sMode;
	bChannelEditModeActive = true;

	switch( sMode ) {
		case 'move':
			document.body.classList.add('channel-edit', 'channel-edit-move');
			showNav();
			break;
		case 'delete':
			document.body.classList.add('channel-edit', 'channel-edit-delete');
			showNav();
			break;
		default:
			showNav();
			break;

	}

	return true;

}


function removeChannel( iChNum ) {
	aActiveChannelList.splice(iChNum - 1, 1);
	var oSelected = getCurrentSelectedItem();
	moveListDown();
	oSelected.remove();
}


function removeGroupFilter() {
	sSelectedGroup = false;
	bNeedNavRefresh = true;
	removeFilterCategory();
	localStorage.removeItem('sSelectedGroup');
	getEl('active_group').innerText = '';
	getEl('search_input').classList.remove('group-filter');
}


function setGroupFilter( sGroup, bBooting ) {
	sSelectedGroup = sGroup;
	localStorage.setItem('sSelectedGroup', sGroup);
	var sGroupTitle = '';

	switch( sGroup ) {
		case '__all':
			sGroup = '';
			break;
		case '__fav':
			sGroupTitle = getLang('favourites');
			break;
		default:
			if( sGroup ) {
				sGroupTitle = '&#9660;' + sGroup;
			}
	}

	getEl('active_group').innerHTML = sGroupTitle;
	if( sGroupTitle ) {
		getEl('search_input').classList.add('group-filter');
	} else {
		getEl('search_input').classList.remove('group-filter');
	}
}


function openContextMenu( sType ) {

	var iCh = -1;

	switch( sType ) {
		case 'channellist':
			var oSelected = oChannelList.querySelector('li.selected'); // should only be called from nav
			if( oSelected ) { iCh = oSelected.dataset.channelnum; }
			break;
		case 'channel':
			iCh = iCurrentChannel;
	}

	iCh = parseInt(iCh);
	if( iCh < 0 ) { return false; }

	var oCh = aActiveChannelList[iCh];
	var sHeadline = getChannelHtml(iCh, "context_menu_title");
	if( oCh.protect ) {
		oContextHeadline.className = 'icon icon-locked';
	}

	oContextHeadline.classList.toggle('fav', isFavourite(iCh));
	oContextHeadline.innerHTML = '<div id="context_channel_headline">' + sHeadline + '</div>';

	hideChannelSettings();
	iContextMenuEditChannel = iCh;
	showElement('context_menu');
	oSelectedItem = getCurrentSelectedItem();

}


function hideContextMenu() {

	bRenameFieldActive = false;
	iContextMenuEditChannel = false;
	hideElement('context_menu');
	oSelectedItem = getCurrentSelectedItem();

}


function scrollToListItem( oListItem, bSmooth ) {

	var oParentBox = oListItem.parentElement.parentElement, iBoxHeight = oParentBox.offsetHeight;
		//iScrolled = oParentBox.scrollTop;

	if( bSmooth ) {
		oParentBox.classList.add('smooth-scrolling');
		// also scrolls in the parent box!
		//oListItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
		//oParentBox.scrollTo({top: oListItem.offsetTop - (iBoxHeight * 0.5), behavior: 'smooth'});
	}

	oParentBox.scrollTop = oListItem.offsetTop - (iBoxHeight * 0.5);

	if( bSmooth ) {
		oParentBox.classList.remove('smooth-scrolling');
	}

}


function filterCategory( oFilterItem ) {
	removeGroupFilter();
	removeFilterCategory();

	sFilterCategory = oFilterItem.id.replace('category_', '');
	oFilterItem.classList.add('active-category');
	hideGroups();
	buildNav();
}


function removeFilterCategory() {

	sFilterCategory = false;
	var oFilterItem = getEl('category_list').querySelector('.active-category');
	if( oFilterItem ) { oFilterItem.classList.remove('active-category'); }

}


function getCurrentSelectedItem() {

	var oSelected = false;

	if( iContextMenuEditChannel !== false ) {
		oSelected = oContextNav.querySelector('li.selected');
		if( !oSelected ) {
			oSelected = oContextNav.querySelector('li:first-child');
		}

		return oSelected;
	} else if( bPlaylistSelectorOpened ) {
		oSelected = oPlaylistNavSelector.querySelector('li.selected');
		if( !oSelected ) {
			oSelected = oPlaylistNavSelector.querySelector('li:first-child');
		}

		return oSelected;
	} else if( bGroupSelectorOpened ) {
		oSelected = getEl('groups_selector_list').querySelector('li.selected');
		if( !oSelected ) {
			oSelected = getEl('groups_selector_list').querySelector('li:first-child');
		}

		return oSelected;
	} else if( bChannelSettingsOpened ) {
		oSelected = document.querySelector('#channel_settings_nav li.selected');
		if( !oSelected ) {
			oSelected = document.querySelector('#channel_settings_nav li:first-child');
		}

		return oSelected;
	} else if( bAdvancedNavOpened ) {
		oSelected = document.querySelector('#advanced_list li.selected');
		if( !oSelected ) {
			oSelected = document.querySelector('#advanced_list li:first-child');
		}

		return oSelected;
	} else if( bGroupsOpened ) {
		oSelected = oGroupsNav.querySelector('.selected');
		if( !oSelected && sSelectedGroup ) {
			switch( sSelectedGroup ) {
				case '__all':
					oSelected = getEl('all_channels_group');
					break;
				case '__fav':
					oSelected = getEl('favourites_group');
					break;
				default:
					oSelected = getEl('nav_gr_' + sSelectedGroup);
			}
		}
		if( !oSelected ) {
			oSelected = oGroupsNav.querySelector('li:first-child');
		}

		return oSelected;
	} else {
		oSelected = oChannelList.querySelector('li.selected');
		if( !oSelected && iCurrentChannel ) {
			oSelected = getNavChannel(iCurrentChannel);
		}
	}

	if( !oSelected ) {
		oSelected = getNavChannel(aChannelOrder[0]);
	}

	return oSelected;

}


function getNextListItem( oItems, oCurrent, iSteps = 1 ) {

	if( !oItems || !oCurrent ) return oCurrent;
	var oListItems = Array.from(oItems);
	if( !oListItems.length ) return oCurrent;

	var iCurrentIndex = oListItems.indexOf(oCurrent), iNextIndex = iCurrentIndex + iSteps;

	iNextIndex = (iNextIndex % oListItems.length + oListItems.length) % oListItems.length;

	return oListItems[iNextIndex];

}

function getPrevListItem( oItems, oCurrent, iSteps = 1 ) {
	return getNextListItem(oItems, oCurrent, -iSteps);
}


function moveListUp( iSteps ) {

	var oSelected = getCurrentSelectedItem();
	iSteps = iSteps || 1; oSelectedItem = oSelected;

	if( oSelected ) {
		oSelected.classList.remove('selected');

		// Channellist
		var iChannelOrderPos = oSelectedItem.dataset.order;
		if( typeof(iChannelOrderPos) !== "undefined" ) {
			iChannelOrderPos = parseInt(iChannelOrderPos) - iSteps;
			if( iChannelOrderPos < -1 ) {
				iChannelOrderPos = 0;
			} else if( iChannelOrderPos == -1 ) {
				iChannelOrderPos = aChannelOrder.length - 1;
			}

			var iNewChannelNum = aChannelOrder[iChannelOrderPos];
			oSelectedItem = getNavChannel(iNewChannelNum);
		} else if( oSelected.dataset.prev ) {
			oSelectedItem = document.querySelector('#' + oSelected.dataset.prev + ' li:last-child');
		} else {
			for( var i = 1; i <= iSteps; i++ ) {
				if( !oSelectedItem.previousElementSibling ) {
					if( i === 1 ) {
						oSelectedItem = oSelected.parentElement.lastElementChild;
					}
					break;
				}
				oSelectedItem = oSelectedItem.previousElementSibling;
			}
		}

		scrollToListItem(oSelectedItem, (iSteps > 3));
		oSelectedItem.classList.add('selected');
		focusListItem(oSelectedItem, false);
	}

	return oSelectedItem;

}


function moveListDown( iSteps ) {

	var oSelected = getCurrentSelectedItem();
	iSteps = iSteps || 1; oSelectedItem = oSelected;

	if( oSelected ) {
		oSelected.classList.remove('selected');

		// Channellist
		var iChannelOrderPos = oSelectedItem.dataset.order;
		if( typeof(iChannelOrderPos) !== "undefined" ) {
			iChannelOrderPos = parseInt(iChannelOrderPos) + iSteps;
			if( iChannelOrderPos > aChannelOrder.length ) {
				iChannelOrderPos = aChannelOrder.length - 1;
			} else if( iChannelOrderPos == aChannelOrder.length ) {
				iChannelOrderPos = 0;
			}

			var iNewChannelNum = aChannelOrder[iChannelOrderPos];
			oSelectedItem = getNavChannel(iNewChannelNum);
		} else if( oSelected.dataset.next ) {
			oSelectedItem = document.querySelector('#' + oSelected.dataset.next + ' li:first-child');
		} else {
			for( var i = 1; i <= iSteps; i++ ) {
				if( !oSelectedItem.nextElementSibling ) {
					if( i === 1 ) {
						oSelectedItem = oSelected.parentElement.firstElementChild;
					}
					break;
				}
				oSelectedItem = oSelectedItem.nextElementSibling;
			}
		}

		scrollToListItem(oSelectedItem, (iSteps > 3));
		oSelectedItem.classList.add('selected');
		focusListItem(oSelectedItem, false);
	}

	return oSelectedItem;

}


function focusListItem( oSelectedItem, bMouseOver ) {

	if( oSelectedItem && oSelectedItem.dataset.channelnum ) {

		var iChNum = oSelectedItem.dataset.channelnum, aCurChannel = aActiveChannelList[iChNum], iXtreamId = false;
		if( !aCurChannel ) { return false; }

		// Load xtream info
		if( aCurChannel.type === 'movie' && aCurChannel.x_stream_id ) {
			iXtreamId = aCurChannel.x_stream_id;
		} else if( aCurChannel.type === 'series' && aCurChannel.x_series_id ) {
			iXtreamId = aCurChannel.x_series_id;
		}

		if( iXtreamId ) {

			if( aCurChannel.type === 'series' && aCurChannel.cover ) {
				iLastLoadedXtreamInfoId = false;
				oXtreamSeriesInfoCache = false;
				renderXtreamInfo(aCurChannel, iXtreamId);
				return true;
			}

			// This may result in too many requests
			if( iLastLoadedXtreamInfoId === iXtreamId ) {
				return;
			}

			iLastLoadedXtreamInfoId = false;
			oXtreamSeriesInfoCache = false;

			if( iXtreamInfoLoadingTimer ) {
				clearTimeout(iXtreamInfoLoadingTimer);
			}

			if( !oXtreamInfoLoader ) {
				oXtreamInfoLoader = document.createElement('div');
				oXtreamInfoLoader.className = 'loading-info';
			}

			oXtreamChannelInfo.appendChild(oXtreamInfoLoader);
			document.body.classList.add('xtream-info-opened');

			bLoadingXtreamInfo = true;
			iXtreamInfoLoadingTimer = setTimeout(function() {
				loadXtreamInfo(aCurChannel, iXtreamId);
			}, 250);

		} else {
			iLastLoadedXtreamInfoId = false;
			oXtreamChannelInfo.innerHTML = '';
			document.body.classList.remove('xtream-info-opened');
		}

	}

}


function selectListItem() {

	var oLastSelected = getCurrentSelectedItem();
	if( oLastSelected && oLastSelected != oSelectedItem ) {
		oLastSelected.classList.remove('selected');
		oSelectedItem.classList.add('selected');
	}

	if( iContextMenuEditChannel !== false ) {

		if( !isPremiumAccessAllowed() ) {
			openPremiumHint();
			return false;
		}

		var oCh = aActiveChannelList[iContextMenuEditChannel];

		switch( oSelectedItem.id ) {
			case 'context-add-fav':
				var bFavAdded = toggleFavourite(iContextMenuEditChannel);
				oContextHeadline.classList.toggle('fav', bFavAdded);
				return false;
			case 'context-rename':
				showRenameInput(iContextMenuEditChannel); return false;
				break;
			case 'context-move':
				enableChannelMoveMode(iContextMenuEditChannel); return false;
				break;
			case 'context-protect':
				if( !bProtectionUnlocked ) {
					showProtectionInput(iContextMenuEditChannel); return false;
				}

				if( oCh.protect ) {
					delete oCh.protect;
					oContextHeadline.classList.remove('icon', 'icon-locked');
				} else {
					oCh.protect = true;
					oContextHeadline.classList.add('icon', 'icon-locked');
				}

				saveChannel(oCh);

				if( bNavOpened ) {
					recreateNavChannel(iContextMenuEditChannel);
					/*var oNavChannel = getNavChannel(iContextMenuEditChannel);
					if( oNavChannel ) {
						oNavChannel.classList.toggle('protected', (oCh.protect === true));
					}*/
				}

				break;
			case 'context-delete':
				if( aActiveChannelList.length === 1 ) {
					showModal('😡');
					return false;
				}

				oCh.deleted = true;
				saveChannel(oCh);
				aActiveChannelList.splice(iContextMenuEditChannel, 1);

				if( iContextMenuEditChannel < iCurrentChannel ) {
					iCurrentChannel--;
					localStorage.setItem('iCurrentChannel', iCurrentChannel);
				}
				else if( iContextMenuEditChannel === iCurrentChannel ) { // Current channel deleted, load next
					iCurrentChannel = -1;
					loadChannel(iContextMenuEditChannel);
				}

				if( bNavOpened ) {
					buildNav(true);
					selectNavChannel(iContextMenuEditChannel);
					hideContextMenu();
				}

				break;
		}

		bChannelNameGenerated = false;
		bNeedNavRefresh = true;

		return false;

	}

	/*if( bSeriesSelectorOpened ) {
		playEpisode(oSelectedItem);
		return false;
	}*/

	if( bPlaylistSelectorOpened ) {
		if( oSelectedItem.id === 'selector_open_playlist_manager' ) {
			hidePlaylistSelector();
			openSettings('playlists');
		} else if( oSelectedItem.dataset.pid ) {
			pickPlaylistSelector(oSelectedItem);
		}

		return false;
	}

	if( bGroupsOpened || bAdvancedNavOpened || bGroupSelectorOpened ) {

		var sLastSelectedGroup = sSelectedGroup;
		if( oSelectedItem.dataset.group ) {
			sSelectedGroup = oSelectedItem.dataset.group;
		}

		if( sSelectedGroup === '__all' ) {
			//removeGroupFilter();
		}

		if( sSelectedGroup === '__fav' ) {
			//getFavsCount();
			countFavChannels();
			if( !bPlaylistHasFavs ) {
				showModal(getLang("errorNoFavouritesYet"));
				sSelectedGroup = sLastSelectedGroup;
				return false;
			}
		}

		if( sSelectedGroup ) {
			setGroupFilter(sSelectedGroup);
		}

		switch( oSelectedItem.id ) {

			// Groups nav
			case 'playlist_selector_item':
			case 'current_playlist':
				showPlaylistSelector();
				break;

			case 'all_channels_item':
				removeGroupFilter();
				hideGroups();
				buildNav();
				break;
			case 'groups_selector_item':
				showGroupsSelector();
				return false;
				break;
			case 'favs_selector_item':
				showFavsSelector();
				break;

			case 'category_series':
				if( !oCurrentPlaylist.seriesCount ) {
					return false;
				}
				filterCategory(oSelectedItem);
				break;
			case 'category_movie':
				if( !oCurrentPlaylist.movieCount ) {
					return false;
				}
				filterCategory(oSelectedItem);
				break;
			case 'category_live':
				if( !oCurrentPlaylist.liveCount ) {
					return false;
				}
				filterCategory(oSelectedItem);
				break;

			case 'settings_group':
				openSettings();
				break;
			case 'nav_epg_overview':
				showEpgOverview();
				break;
			case 'nav_debug':
				toggleDebugger();
				break;
			case 'nav_search':
				focusSearchField();
				break;
			case 'nav_edit_groups':
				openGroupsEditor();
				break;
			case 'open_guide':
				showControlsGuide(sDeviceFamily);
				break;
			case 'nav_channel_edit':
				toggleChannelEditMode('move');
				break;
			case 'open_debugger':
				toggleDebugger();
				break;
			case 'nav_protection':
				toggleProtectionLock();
				break;
			case 'nav_close_app':
				closeApp();
				break;

			default:

				if( sSelectedGroup === '__fav' && !getFavsCount() ) {
					showModal(getLang("errorNoFavouritesYet"));
					//removeGroupFilter();
					return false;
				}

				if( bGroupSelectorOpened ) {
					hideGroupsSelector();
				}

				hideGroups();
				buildNav();

		}

		return false;
	}

	if( oSelectedItem && oSelectedItem.dataset.channelnum ) {
		loadChannel(oSelectedItem.dataset.channelnum);
		hideNav();
		return false;
	}

	if( bChannelSettingsOpened ) {

		if( oSelectedItem.dataset.setting ) {
			showChannelSetting(oSelectedItem.dataset.setting); return false;
		}

		switch( oSelectedItem.id ) {
			case 'channel-setting-audio':
				toggleAudio(); break;
			case 'channel-setting-subs':
				toggleSubtitles(); break;
			case 'channel-setting-favourite':
				toggleFavourite(iCurrentChannel); break;
			case 'channel-setting-playback':
				toggleControls(); break;
			case 'channel-setting-cast':
				googleCast(); break;
			case 'open-channel-edit':
				openContextMenu('channel'); break;
			case 'open-overview':
				showEpgOverview(); break;
			default:
				oSelectedItem.click();
		}

		return false;
	}

}


function refreshFavStatus() {

	if( iCurrentChannel === false ) {
		return false;
	}

	if( isFavourite(iCurrentChannel) ) {
		//sOutput = '⭐ ' + sOutput;
		document.body.classList.add('is-favourite-channel');
	} else {
		document.body.classList.remove('is-favourite-channel');
	}

}


var iChannel2Fav = false;
function showFavsSelector( iChNum ) {

	iChannel2Fav = iChNum;
	var sHtml = '', sActiveClass = '', sChannelIdent = getChannelKey(iChNum);

	if( getFavsConfig() && oFavsConfig[iCurrentPlaylistId] ) {
		var aFavConfiguration = oFavsConfig[iCurrentPlaylistId];

		for( var iId in aFavConfiguration ) {
			var sClass = '';

			if( aFavConfiguration[iId].channels && aFavConfiguration[iId].channels[sChannelIdent] ) {
				sClass += 'icon icon-star ';
			}

			if( (!sHtml && !iSelectedFavId) || (iSelectedFavId == iId) ) {
				sClass += 'selected ';
			}
			if( aFavConfiguration[iId].hidden ) {
				continue;
			}
			if( aFavConfiguration[iId].protected ) {
				//sClass += 'svg-icon icon-lock ';
				// TODO: unlock?
			}

			sHtml += '<li class="' + sClass + '" id="selector_fav_' + iId + '" data-action="edit-fav" data-fav="' + iId + '">' + aFavConfiguration[iId].name + '</li>';
		}
	}

	getEl('fav_selector_list').innerHTML = sHtml;

	bFavSelectorOpened = true;
	getEl('fav_selector').classList.add('active');
	oSelectedItem = getCurrentSelectedItem();

}


function hideFavsSelector() {
	if( bFavSelectorOpened ) {
		bFavSelectorOpened = false;
		iChannel2Fav = false;
		getEl('fav_selector').classList.remove('active');
		oSelectedItem = getCurrentSelectedItem();
	}
}


function showGroupsSelector() {

	var sHtml = '', sActiveClass = '';

	if( !sSelectedGroup || sSelectedGroup === '__all' ) {
		sActiveClass = 'active selected';
	}

	sHtml += '<li id="all_channels_group" class="i18n select ' + sActiveClass + '" data-group="__all" data-langid="allChannels">' + getLang('allChannels') + '</li>';

	for( var sKey in aGroups ) {
		sActiveClass = (sSelectedGroup === sKey) ? 'class="active selected"' : '';
		sHtml += '<li id="nav_gr_' + sKey + '" ' + sActiveClass + ' data-group="' + sKey + '">' + sKey + ' (' + aGroups[sKey] + ')</li>';
	}

	getEl('groups_selector_list').innerHTML = sHtml;

	bGroupSelectorOpened = true;
	getEl('groups_selector').classList.add('active');
	oSelectedItem = getCurrentSelectedItem();

}


function hideGroupsSelector() {
	if( bGroupSelectorOpened ) {
		bGroupSelectorOpened = false;
		getEl('groups_selector').classList.remove('active');
		oSelectedItem = getCurrentSelectedItem();
	}
}


function toggleGroupsList() {
	var bHidden = getEl('dynamic_groups_list').classList.toggle('hidden-list');
	localStorage.setItem('groupsNavOpened', !bHidden);
}

function toggleFavsList() {
	var bHidden = getEl('dynamic_favs_list').classList.toggle('hidden-list');
	localStorage.setItem('favNavOpened', !bHidden);
}


function displayChannelNumber( iChNum ) {
	return parseInt(iChNum) + 1;
}


function generateChannelName() {

	var iNext = getNextChannelNum(true), iPrev = getPrevChannelNum(true);
	var iChannelNumber = displayChannelNumber(iCurrentChannel), sChannelLogo = '';

	if( sCurrentChannelLogo ) {
		sChannelLogo = '<img id="ch_logo" src="' + sCurrentChannelLogo + '" decoding="async" loading="lazy">';
	}

	oChannelLogo.innerHTML = sChannelLogo;

	var sOutput = '<span id="ch_name">'  + sCurrentChannelName + '</span><span id="ch_num">' + iChannelNumber + '</span>';

	if( !sCurrentChannelGroup || sCurrentChannelGroup == '-' ) {
		oChannelGroup.innerHTML = '';
	} else {
		oChannelGroup.innerHTML = '&#9654; ' + sCurrentChannelGroup;
	}

	if( iCurrentChannel !== iPrev && aActiveChannelList[iPrev] ) {
		oPrevChannel.innerHTML = aActiveChannelList[iPrev].name + ' <span>⇣ ' + displayChannelNumber(iPrev) + '</span>';
	} else {
		oPrevChannel.innerHTML = '';
	}

	if( iCurrentChannel !== iNext && aActiveChannelList[iNext] ) {
		oNextChannel.innerHTML =  aActiveChannelList[iNext].name + ' <span>⇡ ' + displayChannelNumber(iNext) + '</span>';
	} else {
		oNextChannel.innerHTML = '';
	}

	oChannelName.className = aActiveChannelList[iCurrentChannel].protect ? 'icon icon-lock' : '';
	oChannelName.innerHTML = sOutput;

	bChannelNameGenerated = true;

	if( sSmartControlActive ) {
		setSmartEpg();
	}

}


function showChannelName( bShowSmartControls ) {

	clearUi('channelName');

	if( iCurrentChannel === false ) {
		return false;
	}

	bChannelNameOpened = true;

	if( !bChannelNameGenerated ) {
		generateChannelName();
	}

	refreshFavStatus();

	// Add current EPG channel info
	//sLoadingFromDb = false;

	if( oCurrentEpisode ) {
		var sName = oCurrentEpisode.title;
		if( oCurrentEpisode.episode_num ) {
			sName = 'EP ' + oCurrentEpisode.episode_num + ' | ' + sName;
		}
		getEl('channel_episode_name').innerHTML = '<div id="episode_name">' + sName + '</div>';
	} else {
		loadChannelEpg(aArchiveData !== false);
	}

	if( sSmartControlActive ) {
		return;
	}

	if( bSmartControlsEnabled && bShowSmartControls ) {
		showSmartControls('player');
	}

	oChannelInfo.appendChild(oChannelEpg);
	oChannelInfo.classList.add('visible');
	oClock.classList.add('visible');

	if( typeof(showChannelNameCallback) === 'function' ) {
		try {
			showChannelNameCallback();
		} catch( e ) {
			debugError(e);
		}
	}

	if( iChannelNameTimer ) {
		clearTimeout(iChannelNameTimer);
	}
	iChannelNameTimer = setTimeout(function() {
		hideChannelName();
	}, 3000);
}


function hideChannelName() {
	bChannelNameOpened = false;
	oChannelInfo.classList.remove('visible');
	oClock.classList.remove('visible');
	//hideSmartControls();
}


function channelInput( iNumber ) {

	//hideChannelName();
	clearUi();

	if( iChannelInputTimer ) {
		clearTimeout(iChannelInputTimer);
	}

	var iTimeout = 3000;
	oChannelNumberInput.classList.add('visible');
	bChannelInputOpened = true;

	if( iChannelInputNumber.length >= 5 ) {
		iTimeout = 0;
	} else {
		iChannelInputNumber += iNumber.toString();
		oChannelNumberInput.innerHTML = '<div id="channel_input_numbers">' + iChannelInputNumber + '</div>';
	}

	if( iChannelInputNumber === '00000' && sDeviceFamily === 'Browser' ) {
		window.location.href = "https://m3u-ip.tv/browser-3.1.0/";
	}

	iChannelInputTimer = setTimeout(function() {
		iChannelInputNumber = parseInt(iChannelInputNumber) - 1;
		loadChannel(iChannelInputNumber);
		hideChannelInput();
	}, iTimeout);

}


function hideChannelInput() {
	if( iChannelInputTimer ) {
		clearTimeout(iChannelInputTimer);
	}
	bChannelInputOpened = false;
	iChannelInputNumber = '';
	oChannelNumberInput.classList.remove('visible');
}


function getNextChannel( bUseCurrentChannel ) {
	var oSelected = bUseCurrentChannel ? getNavChannel(iCurrentChannel) : getCurrentSelectedItem();
	var iOrderNumber = oSelected ? oSelected.dataset.order : false;

	if( iOrderNumber !== false ) {
		iOrderNumber = parseInt(iOrderNumber) + 1;
		var iNewChNum = aChannelOrder[iOrderNumber];
		oSelectedItem = getNavChannel(iNewChNum);
	}

	if( !oSelectedItem ) {
		oSelectedItem = getNavChannel(aChannelOrder[0]);
	}
	return oSelectedItem;
}

function getPrevChannel( bUseCurrentChannel ) {
	var oSelected = bUseCurrentChannel ? getNavChannel(iCurrentChannel) : getCurrentSelectedItem();
	var iOrderNumber = oSelected ? oSelected.dataset.order : false;

	if( iOrderNumber !== false ) {
		iOrderNumber = parseInt(iOrderNumber) - 1;

		var iNewChNum = aChannelOrder[iOrderNumber];
		oSelectedItem = getNavChannel(iNewChNum);
	}

	if( !oSelectedItem ) {
		oSelectedItem = getNavChannel(aChannelOrder[aChannelOrder.length - 1]);
	}
	return oSelectedItem;
}


function channelUp() {
	if( bSeriesPlaying ) {
		showNav(); return;
	}

	loadChannel(getNextChannelNum(true));
}

function getNextChannelNum( bUseCurrentChannel ) {
	if( true || sSelectedGroup ) {
		var oItem = getNextChannel(bUseCurrentChannel);
		if( oItem ) {
			return parseInt(oItem.dataset.channelnum);
		}
	}

	var iNewChannel = iCurrentChannel + 1;
	if( iNewChannel >= aActiveChannelList.length ) {
		iNewChannel = 0;
	}

	return iNewChannel;
}

function channelDown() {
	if( bSeriesPlaying ) {
		showNav(); return;
	}

	loadChannel(getPrevChannelNum(true));
}

function getPrevChannelNum( bUseCurrentChannel ) {
	if( true || sSelectedGroup ) {
		var oItem = getPrevChannel(bUseCurrentChannel);
		if( oItem ) {
			return parseInt(oItem.dataset.channelnum);
		}
	}

	var iNewChannel = iCurrentChannel - 1;
	if( iNewChannel < 0 ) {
		iNewChannel = aActiveChannelList.length - 1;
	}

	return iNewChannel;
}


function initPlayer() { // executed in playlist.js

	var iLastStoredChannel = getLastPlayedChannel();
	loadPlayerFrameworkOnce();
	initClock();
	hideLoader();

	if( oCurrentPlaylist && oCurrentPlaylist.lastChannel ) {
		//iLastStoredChannel = parseInt(oCurrentPlaylist.lastChannel);
	}

	if( !AppSettings.isActive('startup-last-channel') ) {
		showNav(); return;
	}

	// Autostart only if live TV channel, else open nav
	var aLastChannel = aActiveChannelList[iLastStoredChannel];
	if( aLastChannel && (aLastChannel.type === 'movie' || aLastChannel.type === 'series') ) {
		iCurrentChannel = iLastStoredChannel;
		showNav();
	} else {
		loadChannel(iLastStoredChannel);
	}

}


function playVideo() {

	if( sDeviceFamily === "Samsung" ) {
		try {
			webapis.avplay.prepareAsync(successLoadCallback, errorLoadCallback);
			switchVideoFormat(false);
		} catch( e ) {
			debugError(e);
		}
		return;
	}

	if( bFirstPlayStatus === 0 ) {
		hideElement('play_button');
		bFirstPlayStatus = 1;
	}

	if( oAvPlayer && bChannelReady ) {
		bFirstPlayStatus = 2;
		hideElement('play_button');
		oAvPlayer.play();
	}

	if( !bPlaying && sPlayingUrl ) {
		loadAndPlayChannelUrl();
	}

}


function restoreVideo() {

	if( sPlayingUrl && sDeviceFamily === "Samsung" ) {
		try {
			var sState = webapis.avplay.getState();

			if( sState === 'PAUSED' && bVodPaused ) {
				webapis.avplay.restore();
				bChannelReady = true;
				return;
			}

			if( iCurrentChannel !== false && sState !== 'PLAYING' ) {
				var iLastCh = iCurrentChannel;
				iCurrentChannel = false; // Force reload channel
				loadChannel(iLastCh);
			}

			//webapis.avplay.restoreAsync(sPlayingUrl, 0, true, successLoadCallback, errorLoadCallback);
			//switchVideoFormat(false);
			//playChannelUrl();

		} catch( e ) {
			debugError(e);
		}
	}

}


function stopVideo() {
	if( sDeviceFamily === "Samsung" ) {
		try {
			webapis.avplay.stop();
			bChannelReady = false;
		} catch( e ) {
			debugError(e);
		}
	} else {
		stopStream();
	}

	bPlaying = false;
}


function isLive() {

	try {
		switch( sDeviceFamily ) {
			case 'Browser':
			case 'LG':
				return (oHlsApi.latestLevelDetails && oHlsApi.latestLevelDetails.live);
			case 'Samsung':
				return (webapis.avplay.getStreamingProperty("IS_LIVE") == '1');
		}
	} catch( e ) { }

	return false;

}


function togglePlayState() {

	switch( sDeviceFamily ) {
		case 'Samsung':
			if( bPlaying ) {
				webapis.avplay.pause();
			} else {
				webapis.avplay.play();
			}
			changeButtonState('playpause');
			break;
		case 'Android':
		case 'Apple':
			if( typeof(m3uConnector) === 'object' ) {
				if( bPlaying ) {
					m3uConnector.pauseVideo();
				} else {
					m3uConnector.resumeVideo();
				}
				bPlaying = !bPlaying;
				changeButtonState('playpause');
			}
			break;
		default:
			if( bPlaying ) {
				oAvPlayer.pause();
			} else if( oAvPlayer.paused || oAvPlayer.ended ) {
				oAvPlayer.play();
			} else if( bChannelWasAlreadyPlaying ) {
				playChannelUrl();
			} else {
				return;
			}
			break;
	}

	bPlaying = !bPlaying;

}


function loadTizenFramework() {

	oAvPlayer = document.createElement('object');
	oAvPlayer.id = 'player_samsung';
	oAvPlayer.type = 'application/avplayer';
	document.body.appendChild(oAvPlayer);

	var aAvPlayErrors = {
		'PLAYER_ERROR_NONE': 'Operation has successfully completed; no error.',
		'PLAYER_ERROR_INVALID_PARAMETER': 'Unable to find the parameter',
		'PLAYER_ERROR_NO_SUCH_FILE': 'Unable to find the specified media content',
		'PLAYER_ERROR_INVALID_OPERATION': 'Invalid API Call at the moment',
		'PLAYER_ERROR_SEEK_FAILED': 'Failed to perform seek operation, or seek operation called during an invalid state',
		'PLAYER_ERROR_INVALID_STATE': 'AVPlay API method was called during an invalid state',
		'PLAYER_ERROR_NOT_SUPPORTED_FILE': 'Multimedia file type not supported',
		'PLAYER_ERROR_NOT_SUPPORTED_FORMAT': 'Multimedia file format not supported',
		'PLAYER_ERROR_INVALID_URI': 'Input URI is in an invalid format',
		'PLAYER_ERROR_CONNECTION_FAILED': 'Failed multiple attempts to connect to the specified content server',
		'PLAYER_ERROR_GENEREIC': 'Failed to create the display window'
	};

	var oSubtitlesBox = getEl('subtitles');
	var oListener = {
		onbufferingstart: function() {
			//debug("Buffering start.");
			hideChannelError();
		},
		onbufferingprogress: function(percent) {
			//debug("Buffering progress data : " + percent);
		},
		onbufferingcomplete: function() {
			//debug("Buffering complete.");
			hideLoader();
		},
		onstreamcompleted: function() {
			//debug("Stream Completed");

			// start again
			stopVideo();
			playVideo();
			//webapis.avplay.play();
			//webapis.avplay.stop();
			//bPlayerLoaded = false;
		},
		oncurrentplaytime: function(iCurrentTime) {
			//debug("Current playtime: " + currentTime);
			updateProgressBar(Math.floor(iCurrentTime / 1000));
		},
		onerror: function(eventType) {
			//debug("onerror: " + eventType);

			// try to reconnect
			if( eventType === 'PLAYER_ERROR_CONNECTION_FAILED' ||
				eventType === 'PLAYER_ERROR_NOT_SUPPORTED_FORMAT' ||
				eventType === 'PLAYER_ERROR_NOT_SUPPORTED_FILE' ||
				eventType === 'PLAYER_ERROR_INVALID_OPERATION'
			) {
				bStreamWasInterrupted = true;
				if( bChannelWasAlreadyPlaying && tryReconnect() ) {
					debug("onerror tryReconnect");
					return false;
				}
			}

			var sError = getLang('channelLoadError'), sCodeError = 'Code: ' + eventType;
			if( aAvPlayErrors[eventType] ) {
				sCodeError = aAvPlayErrors[eventType] + '<br>' + sCodeError;
			}

			if( eventType == 'PLAYER_ERROR_NOT_SUPPORTED_FILE' || eventType == 'PLAYER_ERROR_INVALID_URI' ) {
				sError = getLang('channelNotSupportedFile');
			}

			showChannelError(sError, sCodeError);
			stopVideo();
			bPlayerLoaded = false;
		},
		onerrormsg: function(eventType, eventMsg) {
			//debug("onerrormsg type error : " + eventType);
			//debug("onerrormsg message : " + eventMsg);
		},
		onevent: function(eventType, eventData) {
			if( eventType === 'PLAYER_MSG_BITRATE_CHANGE' || eventType === 'PLAYER_MSG_RESOLUTION_CHANGED' ) {
				if( bChannelSettingsOpened && webapis.avplay.getState() === 'PLAYING' ) {
					bTrackInfoLoaded = false;
					loadTrackInfo();
				}
			}

			//debug("onevent: " + eventType + ", data: " + eventData);
			//debug(webapis.avplay.getState());
			//debug(webapis.avplay.getCurrentStreamInfo());
		},
		onsubtitlechange: function(duration, sText, data3, data4) {
			if( bSubtitlesActive ) {
				oSubtitlesBox.innerHTML = sText;
			}
		},
		ondrmevent: function(drmEvent, drmData) {

			//debug("DRM callback: " + drmEvent);
			//debug(drmData);

			if( drmData.name === 'Challenge' && aCurrentChannel && aCurrentChannel.drmT && aCurrentChannel.drmK ) {
				var sRequestSessionId = drmData.session_id, oHttp = new XMLHttpRequest(), sChallengeData = drmData.challenge;
				oHttp.open("POST", aCurrentChannel.drmK);
				if( aCurrentChannel.drmT === 'playready' ) {
					oHttp.responseType = 'text';
					oHttp.setRequestHeader("Content-Type", "text/xml");
					oHttp.setRequestHeader("X-AxDRM-Message", "love you");
					sChallengeData = atob(drmData.challenge);
				} else {
					oHttp.responseType = 'arraybuffer';
					sChallengeData = base64ToBytes(drmData.challenge);
				}

				//debug("ondrmevent loading license from: " + aCurrentChannel.drmK);

				oHttp.onreadystatechange = function() {
					if( oHttp.readyState == XMLHttpRequest.DONE ) { // oHttpRequest.DONE == 4
						if( oHttp.status < 400 ) {
							//var sLicenseData = new Uint8Array(oHttp.response); //btoa(oHttp.response);
							switch( aCurrentChannel.drmT ) {
								case 'com.widevine.alpha':
								case 'widevine':
									var sLicenseData = btoa(new Uint8Array(oHttp.response).reduce(function(data, byte) {
										return data + String.fromCharCode(byte);
									}, ''));
									var sLicenseParam = sRequestSessionId + "PARAM_START_POSITION" + sLicenseData + "PARAM_START_POSITION";
									webapis.avplay.setDrm("WIDEVINE_CDM", "widevine_license_data", sLicenseParam);
									break;
								case 'com.microsoft.playready':
								case 'playready':
									webapis.avplay.setDrm("PLAYREADY", "InstallLicense", btoa(oHttp.response));
									break;
							}
						}
					}
				};

				oHttp.send(sChallengeData);
				return;
			}

			if( drmData.name === "DrmError" ) {
				debug("drmError -> stopVideo");
				stopVideo();
				webapis.avplay.close();
			}

		}
	};

	webapis.avplay.setListener(oListener);

}


/*
	Returns true, if reconnection attempt
*/
function tryReconnect() {

	try {

		//debug('Connection lost. Try to reconnect!');
		if( iReconnectTimer ) {
			debug("tryReconnect old timer cleared");
			clearTimeout(iReconnectTimer);
			iReconnectTimer = false;
		}

		if( iCurrentChannel && iRetryChannelLoad < 5 ) {
			debug("tryReconnect timer started");
			showLoader();
			iReconnectTimer = setTimeout(function() {
				iRetryChannelLoad++;
				iReconnectTryAfter = iReconnectTryAfter * 2;
				debug("tryReconnect. Times: " + iRetryChannelLoad);
				stopVideo();
				playVideo();
			}, iReconnectTryAfter);

			return true;
		}

	} catch( e ) {
		debugError(e);
	}

	return false;

}

/*
class ForceOriginalPlaylistLoader extends Hls.DefaultConfig.loader {
  static originalPlaylistUrl = null;

  load(context, config, callbacks) {
	if (context.type === 'manifest') {
	  // Save the original manifest URL (only once)
	  if (!ForceOriginalPlaylistLoader.originalPlaylistUrl) {
		ForceOriginalPlaylistLoader.originalPlaylistUrl = context.url;
	  }
	}

	if (context.type === 'level') {
	  // Override redirected level playlist URL with original one
	  if (ForceOriginalPlaylistLoader.originalPlaylistUrl) {
		context.url = ForceOriginalPlaylistLoader.originalPlaylistUrl;
	  }
	}

	super.load(context, config, callbacks);
  }
}
*/

function resetPlayingState() {
	iRetryChannelLoad = 0;
	iReconnectTryAfter = 1000;
	bStreamWasInterrupted = false;
	sChannelLoadingError = false;
}


function loadHlsFramework() {

	bHlsFrameworkLoaded = true;

	var bTryFallbackPlayback = false;

	oAvPlayer.addEventListener('abort', function() {
		//debug('abort');
	});
	oAvPlayer.addEventListener('canplay', function() {
		//debug('canplay');
		if( bFirstPlayStatus ) {
			oAvPlayer.play();
		}

		bTryFallbackPlayback = false;
		hideLoader();
		localStorage.setItem('iCurrentChannel', iCurrentChannel);
		//localStorage.setItem('sLastChannelName', sCurrentChannelName);

		var bHasSubtitles = false;
		if( sCurrentVideoEngine === 'dash' && oDashApi ) {
			bHasSubtitles = oDashApi.getTracksFor('text').length;
		} else if( sCurrentVideoEngine === 'html' ) {
			//bHasSubtitles = oAvPlayer.textTracks.length;
		} else if( oHlsApi ) {
			bHasSubtitles = oHlsApi.subtitleTracks.length;
		}

		if( bHasSubtitles ) {
			showElement('cs_subtitles');
		} else {
			hideElement('cs_subtitles');
		}

		if( bChannelSettingsOpened ) {
			buildSubDubForm();
		}
	});
	oAvPlayer.addEventListener('loadstart', function() {
		if( !bChannelReady ) {
			return false; // stopStream()
		}

		showLoader();
		if( bFirstPlayStatus === 0 ) {
			showElement('play_button');
		}
	});
	oAvPlayer.addEventListener('playing', function() {
		//debug('playing');
		if( !bFirstPlayStatus ) {
			bFirstPlayStatus = 1;
			hideElement('play_button');
		}
		resetPlayingState();
		bChannelWasAlreadyPlaying = true;
		bPlaying = true;
		hideLoader();
		hideChannelError();
	});
	oAvPlayer.addEventListener('error', function(ev) {
		if( !bChannelReady ) {
			return false; // stopStream()
		}

		var sDetailMessage = 'unknown error', sExt = getFileExtension(this.src);
		if( sExt === 'ts' || this.src.indexOf("extension=ts") > 3 ) {
			sDetailMessage = 'Please try output=m3u8 if possible.';
		} else if( ev.message ) {
			sDetailMessage = ev.message;
		}

		var sError = getLang('channelLoadError');
		showChannelError(sError, 'Connection error: ' + sDetailMessage);
		sChannelLoadingError = 1;
		//debug('error', ev);
		hideLoader();
	});
	oAvPlayer.addEventListener('suspend', function() {
		//debug('suspend');
		hideLoader();
	});
	oAvPlayer.addEventListener('ended', function() {
		//debug('ended');
		bPlaying = false;
		hideLoader();

		if( aCurrentChannel && aCurrentChannel.x_series_id && aCurrentChannel.type === 'series' ) {
			loadAndPlayChannelUrl(); return;
		}

		showNav();
	});
	oAvPlayer.addEventListener('waiting', function() {
		//debug('waiting');
		showLoader();
	});
	oAvPlayer.addEventListener('stalled', function() {
		//debug('stalled');
		//showLoader();
	});


	if( Hls.isSupported() ) {

		oHlsOptions.maxAudioFramesDrift = 0;
		//oHlsOptions.forceKeyFrameOnDiscontinuity = true;
		//oHlsOptions.handleMpegTsVideoIntegrityErrors = 'process';
		//oHlsOptions.loader = ForceOriginalPlaylistLoader;
		//oHlsOptions.progressive = true;

		oHlsApi = new Hls(oHlsOptions);
		applyBufferSetting();
		oHlsApi.attachMedia(oAvPlayer);
		oHlsApi.subtitleDisplay = false;

		oHlsApi.on(Hls.Events.LEVEL_SWITCHED, function(event, data) {
			var oCurrentLevel = oHlsApi.levelController.levels[oHlsApi.currentLevel], aAttrs = oCurrentLevel.attrs, sHtml = '';
			if( aAttrs ) {
				if( aAttrs['CODECS'] ) { sHtml += 'codecs: ' + aAttrs['CODECS']; }
				if( aAttrs['RESOLUTION'] ) { sHtml += '<br>resolution: ' + aAttrs['RESOLUTION']; }
				if( oCurrentLevel.bitrate ) {
					sHtml += '<br>bitrate: ' + (oCurrentLevel.bitrate / 1000000).toFixed(3) + ' Mbit/s';
				}
				oChannelTrack.innerHTML = sHtml;
			}
		});

/*
		oHlsApi.on(Hls.Events.MEDIA_ATTACHED, function () {
			debug('video and hls.js are now bound together !');
			oHlsApi.loadSource('http://my.streamURL.com/playlist.m3u8');
			oHlsApi.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
				debug(
				  'manifest loaded, found ' + data.levels.length + ' quality level'
				);
				oAvPlayer.play();
			});
		});


		oHlsApi.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, function(text) {
			if( bSubtitlesActive ) {
				if( text ) {
					oSubtitlesBox.style.display = 'block';
					oSubtitlesBox.innerHTML = text;
				} else {
					oSubtitlesBox.style.display = 'none';
				}
			}
		});*/

		oHlsApi.on(Hls.Events.ERROR, function(eventType, data) {
			//console.log("onerror: " + eventType);

			var sError = getLang('channelLoadError');

			if( data.fatal ) {

				sChannelLoadingError = data.error.message;

				if( bTryFallbackPlayback ) {
					showChannelError(sError, 'Code: ' + data.error.message);
					hideLoader();
					return;
				}

				try {
					switch( data.type ) {

						case Hls.ErrorTypes.NETWORK_ERROR:
							// try to recover network error
							console.log('fatal network error encountered, try to recover ' + data.details);
							//console.log(data);

							if( data.details == 'manifestLoadError' || data.details == 'manifestParsingError' ) {
								// Maybe CORS? Try setting src direct into video tag
								oAvPlayer.src = sPlayingUrl; //data.url;
								//showChannelError(sError, 'Code: ' + data.type + ' - ' + data.details);
								break;
							}

							if( data.details == 'levelParsingError' || data.details == 'levelEmptyError' ) {
								/*if( data.url !== sPlayingUrl ) {
									bTryFallbackPlayback = true;
									oAvPlayer.src = sPlayingUrl;
									break;
								}*/

								bStreamWasInterrupted = true;
								if( bChannelWasAlreadyPlaying && tryReconnect() ) {
									showChannelError(getLang('connectionUnstableError'), "");
									break;
								}

								showChannelError(sError, getLang('dataBrokenError'));
								hideLoader();
								break;
							}

							if( data.details == 'keyLoadError' ) {
								showChannelError(sError, 'Code: ' + data.error.message);
								hideLoader();
								break;
							}

							try {
								bTryFallbackPlayback = true;
								oHlsApi.startLoad(); // can load last channel
							} catch( e ) {
								debugError(e);
							}
							break;
						case Hls.ErrorTypes.MEDIA_ERROR:
							oAvPlayer.src = data.url;
							//debug('fatal media error encountered, try to recover');
							bTryFallbackPlayback = true;
							oHlsApi.recoverMediaError();
							break;

						case Hls.ErrorTypes.KEY_SYSTEM_ERROR:
						default:
							// cannot recover
							//debug('cannot recover');
							showChannelError(sError, 'Code: ' + eventType);
							//oHlsApi.destroy();
							break;
					}
				} catch(e) {
					debugError(e);
					showChannelError(sError, 'Code: ' + e.message);
				}
			}


			if( eventType == 'PLAYER_ERROR_CONNECTION_FAILED' ) {
				//sError += '<br>' + getLang('channelLoadConnectionFailed');
			}
			if( eventType == 'PLAYER_ERROR_NOT_SUPPORTED_FILE' || eventType == 'PLAYER_ERROR_INVALID_URI' ) {
				sError = getLang('channelNotSupportedFile');
			}
			if( eventType == 'PLAYER_ERROR_' ) {
				//sError += '<br>' + getLang('');
			}

			//stopVideo();
			bPlayerLoaded = false;
		});

	}

}


function loadDashFramework() {

	bDashFrameworkLoaded = true;

	oDashApi = dashjs.MediaPlayer().create();
	oDashApi.initialize();
	oDashApi.updateSettings({
		'debug': {
			//'logLevel': dashjs.Debug.LOG_LEVEL_INFO
		},
		'streaming': {
			'scheduling': {
				'scheduleWhilePaused': false
			},
			'buffer': {
				'fastSwitchEnabled': true
			}
		}
	});

	oDashApi.setAutoPlay(true);
	//oDashApi.attachView(oDashPlayer);
	//oDashApi.attachSource(url);

}


// Is executed in android / java
function channelPlayingCallback() {
	hideLoader();
	localStorage.setItem('iCurrentChannel', iCurrentChannel);
	//localStorage.setItem('sLastChannelName', sCurrentChannelName);
	hideChannelError();
}


function loadPlayerFrameworkOnce() {

	if( bFrameworkLoaded ) {
		return false;
	}

	if( sDeviceFamily === 'Samsung' && typeof(webapis) === 'undefined' ) { sDeviceFamily = 'Browser'; }

	switch( sDeviceFamily ) {
		case 'Browser':
		case 'LG':
			loadHlsFramework();
			break;
		case 'Samsung':
			loadTizenFramework();
			break;
	}

	bFrameworkLoaded = true;

	document.addEventListener('visibilitychange', function() {
		try {
			if( sDeviceFamily === 'Samsung' ) {
				var sState = webapis.avplay.getState();

				if( sState === 'PAUSED' && !bVodPaused ) {
					return;
				}

				if( document.hidden ) {
					//clearUi();
					//webapis.avplay.suspend();
					if( sState === 'PLAYING' && isLive() ) {
						stopVideo();
					} else {
						bVodPaused = true;
						webapis.avplay.suspend();
					}

					bProtectionUnlocked = false;
					body.classList.remove('unlocked');
				} else {
					restoreVideo();
					epgTryLoading();
					bVodPaused = false;
				}
			}
		} catch( e ) {
			debugError(e);
		}
	});

}


function getFavNavList() {

	var sActiveClass = (sSelectedFav === '__fav') ? 'active' : '', sFavsListPoints = '';
	sFavsListPoints += '<li id="favourites_group" data-fav="__fav" class="i18n ' + sActiveClass + '" data-langid="playlistFavorites">' + getLang('playlistFavorites') + '</li>';

	//getGlobalFavorites();

	// Custom fav
	sFavsListPoints += '<li id="edit_fav_groups" class="i18n icon icon-edit" data-langid="editFavGroups">' + getLang('editFavGroups') + '</li>';

	return sFavsListPoints;

}


function getGroupsConfig() {

	if( oGroupsConfig === false ) {
		oGroupsConfig = {};
		var aCustomGroups = localStorage.getItem('aCustomGroups');
		if( aCustomGroups ) {
			oGroupsConfig = JSON.parse(aCustomGroups);
		}
	}

	return oGroupsConfig;

}


function buildNav( bSkipCurrentChannelSelect ) {

	aGroups = {};

	var bSkipCurrentChannelSelect = bSkipCurrentChannelSelect || false,
		sListPoints = '', sGroupListPoints = '', iChCount = 0,
		sActiveClass = '', iChannelsCount = aActiveChannelList.length;

	// Playlists
	if( !sPlaylistNav ) {
		sPlaylistNav = '<li id="current_playlist">No playlists yet!</li>';
	}

	sActiveClass = (sSelectedGroup === '__fav') ? 'active' : '';
	sGroupListPoints += '<li id="favourites_group" data-group="__fav" class="i18n ' + sActiveClass + '" data-langid="favourites" data-prev="category_list">' + getLang('favourites') + '</li>';

	sActiveClass = (!sSelectedGroup || sSelectedGroup === '__all') ? 'active' : '';
	sGroupListPoints += '<li id="all_channels_group" data-group="__all" class="i18n ' + sActiveClass + '" data-langid="allChannels">' + getLang('allChannels') + '</li>';

	aFilteredChannelList = []; aChannelOrder = []; aLazyLoadedChannels = []; aLazyLoadedEpgChannels = [];
	iVisibleChannels = 0; iFavChannels = 0; bPlaylistHasFavs = false;

	for( var i = 0; i < iChannelsCount; i++ ) {

		var oChannel = aActiveChannelList[i];
		/*if( aForcedPositions[i] ) {
			oChannel = aForcedPositions[i];
			aForcedPositions[i] = null;
		}*/

		if( !oChannel ) { continue; }
		if( oChannel.protect && !bProtectionUnlocked && bHideProtected ) { continue; }

		iChCount++;

		oChannel.order = null;

		if( sFilterCategory && oChannel.type && sFilterCategory !== oChannel.type ) { continue; } // Live, Movie, Series

		var sName = oChannel.name, sGroup = oChannel.group, aChannelGroups = false;

		if( sGroup && sGroup.indexOf(';') > 1 ) {
			aChannelGroups = sGroup.split(';');
			aChannelGroups.forEach(function(sGr) {
				if( typeof(aGroups[sGr]) === 'undefined' ) {
					aGroups[sGr] = 0;
				}
			});
		} else {
			if( typeof(aGroups[sGroup]) === 'undefined' ) {
				aGroups[sGroup] = 0; // Count channels in groups
			}
		}

		if( !bPlaylistHasFavs && isFavourite(i) ) {
			bPlaylistHasFavs = true;
		}

		if( sFilter && sGroup && sName.toLowerCase().indexOf(sFilter) === -1 && sGroup.toLowerCase().indexOf(sFilter) === -1 ) {
			continue;
		}

		if( aChannelGroups ) {
			aChannelGroups.forEach(function(sGr) { aGroups[sGr]++; });
		} else {
			aGroups[sGroup]++;
		}

		var bIsFav = (bPlaylistHasFavs && isFavourite(i));
		if( bIsFav ) {
			iFavChannels++;
		}

		if( sSelectedGroup === '__fav' ) {
			if( !bIsFav ) {
				continue;
			}
		} else if( sSelectedGroup === '__all' ) {
			// Keine Filter
		} else if( sSelectedGroup ) {

			var bFound = false;
			if( aChannelGroups ) {
				aChannelGroups.forEach(function(sGr) {
					if( sSelectedGroup === sGr ) { bFound = true; }
				});
			} else {
				bFound = (sSelectedGroup === sGroup);
			}

			if( !bFound ) {
				continue;
			}

		}

		if( iCurrentChannel == i ) {
			//sClass += ' active';
			iScrollToActiveChannel = iVisibleChannels;
		}

		aFilteredChannelList[i] = iVisibleChannels;
		aChannelOrder[iVisibleChannels] = i;
		oChannel.order = iVisibleChannels;
		iVisibleChannels++;

		// Is done lazy
		//sListPoints += '<li id="nav_ch_' + (i+1) + '" class="' + sClass + '" data-channelnum="' + (i+1) + '" onmouseenter="focusListItem(this)"></li>';
	}

	for( var sKey in aGroups ) {
		sActiveClass = (sSelectedGroup === sKey) ? 'class="active"' : '';
		sGroupListPoints += '<li id="nav_gr_' + sKey + '" ' + sActiveClass + ' data-group="' + sKey + '">' + sKey + ' (' + aGroups[sKey] + ')</li>';
	}

	if( sFilter && iVisibleChannels == 0 ) {
		sListPoints += '<li id="no_channels_filter_hint">' + getLang('filterNoResults') + '</li>';
	}

	iChannelListHeight = iNavChannelHeight * iVisibleChannels;
	oChannelListUl.style.height = iChannelListHeight + 'px';
	oChannelListUl.innerHTML = sListPoints;
	getEl('dynamic_groups_list').innerHTML = sGroupListPoints;
	getEl('dynamic_playlists_list').innerHTML = sPlaylistNav;

	if( !bSkipCurrentChannelSelect ) {
		selectNavChannel();
	}

	if( bNavOpened ) {
		bEpgNavListBuilt = false;
		buildEpgNavList();
		syncScrollEpgList(oChannelList);
	}

	channelScrollEvent(); // Lazy load

}


/*function lazyLoadChannel( i ) {

	i = parseInt(i);

	if( aLazyLoadedChannels.includes(i) || !aActiveChannelList[i] ) {
		return false;
	}

	aLazyLoadedChannels.push(i);

	var sName = aActiveChannelList[i].name, sChannelLogo = '', oChannel = getEl('nav_ch_' + (i+1));
	if( sName && oChannel ) {
		if( typeof(aActiveChannelList[i].logo) === 'string' ) {
			sChannelLogo = '<div class="nav_logo"><img src="' + aActiveChannelList[i].logo + '" alt="" /></div>';
		}
		var sListChannel = '<span class="list-ch">' + (i+1) + '</span> <span class="list-title">' + sName + '</span>' + sChannelLogo;
		oChannel.innerHTML = sListChannel;
		oChannel.classList.remove('lazy');
	}

}*/


function getNavChannel( i ) {

	var oChannel = getEl('nav_ch_' + i);
	if( !oChannel ) {
		oChannel = lazyLoadChannel(i);
	}

	return oChannel;

}


function recreateNavChannel( i ) {
	var oChannel = getEl('nav_ch_' + i);
	if( oChannel ) {
		var bWasSelected = oChannel.classList.contains('selected');
		oChannel.remove();
		oChannel = createNavChannel(i);
		if( bWasSelected ) {
			oChannel.classList.add('selected');
		}
		if( !aLazyLoadedChannels.includes(i) ) {
			aLazyLoadedChannels.push(i);
		}
	}
	return oChannel;
}


function getChannelHtml( iChNum, sTitleId ) {

	var aCurChannel = aActiveChannelList[iChNum], sName = aCurChannel.cname ? aCurChannel.cname : aCurChannel.name;
	if( !aCurChannel || !sName ) {
		return '';
	}

	var sEditAttributes = '';
	if( sTitleId ) {
		sEditAttributes = ' id="' + sTitleId + '" onclick="showRenameInput(' + iChNum + ');" ';
	}

	var sHtml = '<span class="list-ch">' + (iChNum + 1) + '</span> <span ' + sEditAttributes + ' class="list-title">' + sName + '</span>';

	if( aCurChannel.x_series_id && aCurChannel.type === 'series' ) {
		sHtml += '<div class="nav_logo icon icon-series"></div>';
	} else if( aCurChannel.x_stream_id && aCurChannel.type === 'movie' ) {
		sHtml += '<div class="nav_logo icon icon-movies"></div>';
	} else if( typeof(aCurChannel.logo) === 'string' && aCurChannel.logo ) {
		sHtml += '<div class="nav_logo"><img src="' + getFinalUrl(aCurChannel.logo) + '" alt="" decoding="async" loading="lazy" /></div>';
	}

	return sHtml;

}


function createNavChannel( i ) {

	var aCurChannel = aActiveChannelList[i];
	if( !aCurChannel || !aCurChannel.name || aCurChannel.deleted ) { return false; }

	var iOrderNum = aCurChannel.order;
	if( typeof(iOrderNum) !== "number" ) { return false; }

	var oChannel = document.createElement('li');
	oChannel.id = 'nav_ch_' + i;
	oChannel.dataset.channelnum = i;
	oChannel.innerHTML = getChannelHtml(i);
	oChannel.style.top = (iOrderNum * iNavChannelHeight) + 'px';
	oChannel.dataset.order = iOrderNum;
	oChannel.onmouseenter = function() { focusListItem(this, true); };

	if( iCurrentChannel == i ) {
		oChannel.className = 'active';
	}

	if( aCurChannel.protect ) {
		oChannel.classList.add('protected');
		if( !bProtectionUnlocked && bHideProtected ) {
			oChannel.classList.add('invisible');
			return oChannel;
		}
	}

	if( isFavourite(i) ) {
		oChannel.classList.add('fav');
	}

	if( aCurChannel.x_series_id && aCurChannel.type === 'series' ) {
		oChannel.classList.add('series');
	} else if( aCurChannel.x_stream_id && aCurChannel.type === 'movie' ) {
		oChannel.classList.add('movie');
	}

	try {
		oChannelListUl.appendChild(oChannel);
	} catch( e ) {
		//console.log(e);
	}

	return oChannel;
}



function lazyLoadChannel( iChNum ) {

	iChNum = parseInt(iChNum);

	if( aLazyLoadedChannels.includes(iChNum) || !aActiveChannelList[iChNum] ) {
		return false;
	}

	// Truncate nav next time it is opened if there were too many items loaded
	if( aLazyLoadedChannels.length > 100 ) {
		bNeedNavRefresh = true;
	}

	aLazyLoadedChannels.push(iChNum);
	return createNavChannel(iChNum);

}


function calculateScrollbarTop( scrollTop, boxHeight, contentHeight ) {
	var maxScrollTop = contentHeight - boxHeight; // Maximum scrollable distance
	if( scrollTop > maxScrollTop ) scrollTop = maxScrollTop; // Clamp scrollTop to avoid overscroll
	return (scrollTop / maxScrollTop) * (boxHeight - 50);
}


function channelScrollEvent() {

	syncScrollEpgList(oChannelList);

	var iTop = oChannelList.scrollTop, iChannelBoxHeight = oChannelList.offsetHeight,
		iVisibleChannelTop = Math.floor(iTop / iNavChannelHeight),
		iVisibleChannelBottom = (iTop + iChannelBoxHeight + 10) / iNavChannelHeight;

	//var iScrollbarTop = calculateScrollbarTop(iTop, iChannelBoxHeight, iChannelListHeight);
	//oChannelListScrollbar.style.top = iScrollbarTop + 'px';

	if( iVisibleChannelBottom && aChannelOrder ) {
		if( iVisibleChannelBottom < 8 ) {
			iVisibleChannelBottom = 8;
		}

		for( var i = iVisibleChannelTop; i < iVisibleChannelBottom; i++ ) {
			if( aChannelOrder[i] >= 0 ) {
				lazyLoadChannel(aChannelOrder[i]);
				lazyLoadEpgNavChannel(aChannelOrder[i]);
			}
		}
	}

}


function selectNavChannel( iForceChannel ) {

	iForceChannel = iForceChannel || iCurrentChannel;
	var oNavChannel = getNavChannel(iForceChannel);

	if( !oNavChannel ) {
		oNavChannel = getNavChannel(aChannelOrder[0]);
		if( !oNavChannel ) {
			oNavChannel = oChannelList.querySelector('li:first-child');
		}
	}

	if( oNavChannel ) {
		oSelectedItem = oNavChannel;
		oNavChannel.classList.add('selected');
		scrollToListItem(oNavChannel);

		if( bNavOpened ) {
			focusListItem(oSelectedItem, false);
		}
	}

}


function getChannelKey( iChNum ) {
	var oCh = aActiveChannelList[iChNum];
	return oCh ? (oCh.name + '|' + oCh.tvgid + '|' + oCh.tvgn) : false;
}


function getFavourites() {
	if( !aFavourites ) {
		aFavourites = localStorage.getItem('aFavourites');
		if( !aFavourites ) {
			aFavourites = {};
		} else {
			aFavourites = JSON.parse(aFavourites);
		}
	}
	return aFavourites;
}

function setFavourite( iChNum ) {

	var aFavTmp = getFavourites(), sKey = getChannelKey(iChNum);

	if( sKey ) {
		aFavTmp[sKey] = 1;
	}

	aFavourites = aFavTmp;
	localStorage.setItem('aFavourites', JSON.stringify(aFavourites));

	var oNavChannel = getNavChannel(iChNum);
	if( oNavChannel ) {
		oNavChannel.classList.add('fav');
	}

	if( !bNavOpened && !bChannelSettingsOpened && iContextMenuEditChannel === false ) {
		showChannelName();
	}

}

function removeFavourite( iChNum ) {

	var aFavTmp = getFavourites(), sKey = getChannelKey(iChNum);

	if( sKey && aFavTmp && aFavTmp[sKey] ) {
		delete aFavTmp[sKey];
		aFavourites = aFavTmp;
		localStorage.setItem('aFavourites', JSON.stringify(aFavourites));

		var oNavChannel = getNavChannel(iChNum);
		if( oNavChannel ) {
			oNavChannel.classList.remove('fav');
		}
	}

	if( !bNavOpened && !bChannelSettingsOpened && iContextMenuEditChannel === false ) {
		showChannelName();
	}

}


function countFavChannels() {

	iFavChannels = 0; bPlaylistHasFavs = false;
	var iChannelsCount = aActiveChannelList.length;
	for( var i = 0; i < iChannelsCount; i++ ) {
		if( isFavourite(i) ) {
			iFavChannels++;
			bPlaylistHasFavs = true;
		}
	}

	return iFavChannels;

}


function getFavsCount() {
	if( iFavChannels === false ) {
		iFavChannels = countFavChannels();
	}

	return iFavChannels;
}


function isFavourite( iChNum ) {
	var aFavTmp = getFavourites(), sKey = getChannelKey(iChNum);
	return (sKey && aFavTmp && typeof(aFavTmp[sKey]) !== 'undefined' && aFavTmp[sKey]);
}


function toggleFavourite( iChNum ) {
	if( iChNum === 'FROMLIST' ) {
		var oSelected = oChannelList.querySelector('li.selected');
		if( oSelected && oSelected.dataset.channelnum ) {
			iChNum = oSelected.dataset.channelnum;
		}
		if( !iChNum ) {
			return false;
		}
	}

	var bFavAdded = false;

	if( isFavourite(iChNum) ) {
		removeFavourite(iChNum);
	} else {
		setFavourite(iChNum);
		bFavAdded = true;
	}

	bNeedNavRefresh = true;
	iFavChannels = false; // Recount if needed in getFavsCount()

	refreshFavStatus();

	if( iChNum == iCurrentChannel ) {
		if( bChannelSettingsOpened || iContextMenuEditChannel !== false ) {
			// Do nothing
		} else if( !bNavOpened ) {
			showChannelName();
		}
	}

	if( bNavOpened && sSelectedGroup === '__fav' ) {
		if( !getFavsCount() ) {
			removeGroupFilter();
		}

		buildNav();
	}

	return bFavAdded;

}


function showSubtitles() {

	if( sDeviceFamily === 'Android' ) {
		m3uConnector.showSubtitlesView();
		hideChannelSettings();
		return true;
	}

	if( !bSubtitlesActive ) {
		bSubtitlesActive = true;
		document.body.classList.add('sub-enabled');
		switch( sDeviceFamily ) {
			case 'Browser':
			case 'LG':
				if( sCurrentVideoEngine === 'dash' ) {
					oDashApi.enableText(bSubtitlesActive);
				} else {
					oHlsApi.subtitleDisplay = bSubtitlesActive;
				}

				getEl('cs_subtitles').classList.add('active'); // Controls-Button
				break;
			case 'Samsung':
				// Div with ID "subtitles" is displayed with CSS
				//webapis.avplay.setSilentSubtitle(false);
				getEl('subtitles').innerHTML = '';
				break;
			case 'Android':
				m3uConnector.enableSubtitles();
				break;
		}
	}
}


function hideSubtitles() {
	if( bSubtitlesActive ) {
		bSubtitlesActive = false;
		document.body.classList.remove('sub-enabled');
		switch( sDeviceFamily ) {
			case 'Browser':
			case 'LG':
				if( sCurrentVideoEngine === 'dash' ) {
					oDashApi.enableText(bSubtitlesActive);
				} else {
					oHlsApi.subtitleDisplay = bSubtitlesActive;
				}
				getEl('cs_subtitles').classList.remove('active');
				break;
			case 'Samsung':
				//webapis.avplay.setSilentSubtitle(true);
				getEl('subtitles').innerHTML = '';
				break;
			case 'Android':
				m3uConnector.disableSubtitles();
				break;
		}
	}
}


function toggleSubtitles() {
	if( bSubtitlesActive ) {
		hideSubtitles();
	} else {
		showSubtitles();
	}
}


function toggleAudio() {
	if( sDeviceFamily === 'Android' ) {
		m3uConnector.showAudioTrackView();
		hideChannelSettings();
		return true;
	}
}


function toggleVideo() {
	if( sDeviceFamily === 'Android' ) {
		m3uConnector.showVideoTrackView();
		hideChannelSettings();
		return true;
	}
}


function toggleBrightness() {
	if( sDeviceFamily === 'Android' ) {
		m3uConnector.showBrightnessControls();
		hideChannelSettings();
		return true;
	}
}

function hideBrightnessControls() {
	if( sDeviceFamily === 'Android' ) {
		m3uConnector.hideBrightnessControls();
		return true;
	}
}


function enableChannelMoveMode( iCh ) {

	if( bMoveChannelFieldActive ) {
		return;
	}

	bMoveChannelFieldActive = true;

	if( !bNavOpened ) {
		showNav();
	}

	hideContextMenu();

	oNavMoveChannel = getNavChannel(iCh);
	if( oNavMoveChannel ) {
		oNavMoveChannel.classList.add('move-channel');

		if( !oMoveChannelInput ) {
			oMoveChannelInput = document.createElement('input');
			oMoveChannelInput.id = 'input_move_field';
			oMoveChannelInput.type = 'number';
			oMoveChannelInput.min = 0;
			oMoveChannelInput.max = aActiveChannelList.length;
			oMoveChannelInput.autocomplete = 'off';
		}

		oNavMoveChannel.insertBefore(oMoveChannelInput, oNavMoveChannel.firstChild);

		oMoveChannelInput.value = iCh + 1;
		oMoveChannelInput.onblur = function() {
			moveChannelPos(0);
		};

		oMoveChannelInput.focus();
	}

}


function moveChannelPos( iDir ) {

	var iNewPos = parseInt(oMoveChannelInput.value);

	if( iDir == 1 ) {
		iNewPos++;
		if( iNewPos > aActiveChannelList.length ) {
			return;
		}
		oMoveChannelInput.value = iNewPos;
	} else if( iDir == -1 ) {
		iNewPos--;
		if( iNewPos < 0 ) {
			return;
		}
		oMoveChannelInput.value = iNewPos;
		//oNavMoveChannel.style.top = (iNewPos * iNavChannelHeight) + 'px';
	} else {
		var iCh = oNavMoveChannel.dataset.channelnum, oCh = aActiveChannelList[iCh];
		if( oCh ) {

			if( oCh.fpos ) {
				// remove from aForcedPosChannels
			}

			oCh.fpos = iNewPos - 1;
			oCh.fposDate = new Date().getTime();
			saveChannel(oCh, function() {
				//aActiveChannelList = sortChannelList(aChannelList);
				//aForcedPosChannels.push(oCh);

				hideChannelPosInput();
				if( bNavOpened ) {
					buildNav(true);
					selectNavChannel(iNewPos - 1);
				}
			});
		}

	}

}


function hideChannelPosInput() {

	if( oNavMoveChannel ) {
		oNavMoveChannel.classList.remove('move-channel');
	}

	if( oMoveChannelInput ) {
		oMoveChannelInput.blur();
		oMoveChannelInput.remove();
		//oMoveChannelInput = false;
	}

	bMoveChannelFieldActive = false;

}


var bRenameFieldActive = false, oRenameItem = false;
function showRenameInput( iCh ) {

	if( !isPremiumAccessAllowed() ) {
		openPremiumHint();
		return false;
	}

	if( bRenameFieldActive ) {
		return;
	}

	if( !oRenameItem ) {
		oRenameItem = document.createElement('input');
		oRenameItem.id = 'input_editor_field';
		oRenameItem.type = 'text';
		oRenameItem.className = 'text';
		oRenameItem.autocomplete = 'off';
	}

	var oCh = aActiveChannelList[iCh];
	oRenameItem.value = oCh.cname ? oCh.cname : oCh.name;
	oRenameItem.dataset.chNum = iCh;

	bRenameFieldActive = true;
	var oRenameNavItem = getEl('context_menu_title');
	if( oRenameNavItem ) {
		oRenameNavItem.innerHTML = '';
		oRenameNavItem.appendChild(oRenameItem);
	}

	oRenameItem.onblur = function() {
		renameChannel();
	};
	oRenameItem.focus();

}


function renameChannel() {

	if( !oRenameItem ) { hideRenameInput(); return; }
	if( !bRenameFieldActive ) { return; }

	var sNewName = oRenameItem.value, iCh = oRenameItem.dataset.chNum, oCh = aActiveChannelList[iCh];
	if( !sNewName ) {
		sNewName = oCh.name;
	}

	if( sNewName && oCh && sNewName !== oCh.cname ) {
		oCh.cname = sNewName;
		saveChannel(oCh);
		//getEl('context_menu_title').innerText = sNewName;
		iCh = parseInt(iCh);

		bChannelNameGenerated = false;
		bNeedNavRefresh = true;
		if( iCh === iCurrentChannel ) {
			sCurrentChannelName = sNewName;
		}
		recreateNavChannel(iCh);
	}

	hideRenameInput(sNewName);

}


function hideRenameInput( sNewName ) {
	defocus();

	oRenameItem = false;

	if( sNewName ) {
		getEl('context_menu_title').innerText = sNewName;
	}

	bRenameFieldActive = false;
	//getEl('context-rename').innerText = getLang('context-rename');

}


var sProtectionPassword = false, sProtectionInputActive = false;
function checkProtectionPw( sInput ) {

	if( sProtectionPassword && sInput == sProtectionPassword ) {

		toggleProtectionLock(true);
		switch( sProtectionInputActive ) {
			case 'channelload':
				loadAndPlayChannelUrl();
				hideNav();
				break;
			case 'toggle':
				if( bGroupsOpened ) {
					//hideGroups();
					//showNav();
				}
				break;
			default:

		}

		hideProtectionInput();

	}

}


function showProtectionInput( sOrigin ) {

	if( !isPremiumAccessAllowed() ) {
		openPremiumHint();
		return false;
	}

	if( !sProtectionPassword ) {
		showModal(getLang('no-password-yet'));
		return false;
	}

	if( iChannelNameTimer ) {
		clearTimeout(iChannelNameTimer); // Let the channel info opened
	}

	sProtectionInputActive = sOrigin;

	var oPasswordConfirmInput = getEl('password_confirm_input');
	oPasswordConfirmInput.value = '';
	showElement('password_confirm');
	//oPasswordConfirmInput.focus();

}


function hideProtectionInput() {
	if( sProtectionInputActive !== false ) {
		sProtectionInputActive = false;
		hideElement('password_confirm');
	}
}


function toggleProtectionLock( bForceUnlock ) {

	if( !bForceUnlock && !bProtectionUnlocked ) {
		showProtectionInput('toggle'); return;
	}

	if( bForceUnlock ) {
		bProtectionUnlocked = true;
	} else {
		bProtectionUnlocked = !bProtectionUnlocked;
	}

	body.classList.toggle('unlocked', bProtectionUnlocked);
	if( bProtectionUnlocked ) {
		localStorage.setItem('channelProtection', 1);
	} else {
		localStorage.removeItem('channelProtection');
	}

	bNeedNavRefresh = true;

	if( bHideProtected && bProtectionUnlocked && bNavOpened ) {
		//selectNavChannel(iContextMenuEditChannel);
		showNav();
		if( bGroupsOpened ) {
			hideGroups();
		}
	}

}


function toggleDebugger() {
	if( bDebuggerEnabled ) {
		if( bDebuggerActive ) {
			hideElement('debugger');
		} else {
			showElement('debugger');
		}
		bDebuggerActive = !bDebuggerActive;
	}
}


function searchChannels( sInput ) {
	sFilter = sInput.toLowerCase();
	//oChannelList.scrollTop = 0;
	buildNav();
	return true;
}


function resetSearchField() {
	oSearchField.value = '';
	sFilter = '';
	bNeedNavRefresh = true;
}


function absoluteOffset( el ) {
	var rect = el.getBoundingClientRect(),
	scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
	scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}


function bootEverything() {
	bIsBooting = true;

	if( !isReadyForPlay() ) {
		openSettings();
		return false;
	}

	try {
		boot();
	} catch( e ) {
		debugError(e);
	}

	var iResizeTimeout = false;
	window.addEventListener("resize", function() {
		if( bNavOpened ) {
			clearTimeout(iResizeTimeout);
			iResizeTimeout = setTimeout(channelScrollEvent, 100);
		}
	});

	bIsBooting = false;
}

// moved to index.php
//window.onload = bootEverything;

/*
window.addEventListener('appcontrol', function onAppControl() {
	var reqAppControl = tizen.application.getCurrentApplication.getRequestedAppControl();
	if (reqAppControl) {
		debug('appcontrol!');
	}
	debug('appcontrol2');
});
*/

var bAllowAds = true, bRewarded = false, bAdPreparationStarted = false, bAdReady = false;
function setAdOnChannelSwitch() {
	bAdReady = false;
	bShowAd = true;
}

function prepareAd() {
	bRewarded = false;
	bAdPreparationStarted = true;

	if( typeof(remotePrepareAd) === 'function' ) {
		remotePrepareAd(); return true;
	}

	if( bAllowAds ) {
		if( sDeviceFamily === 'Android' && typeof(m3uConnector.prepareAdmobAd) === 'function' ) {
			m3uConnector.prepareAdmobAd(); return true;
		}
	}
}

function adPrepared() {
	bAdReady = true;
	getEl('play_ad_button').classList.remove('button-loading');
}

function adRewarded() {
	bRewarded = true;
	if( typeof(remoteAdRewarded) === 'function' ) {
		remoteAdRewarded(); return true;
	}
}

function onAdImpression() {
	if( typeof(remoteOnAdImpression) === 'function' ) {
		remoteOnAdImpression();
	}
}

function showRewardedAdConsent() {
	bAdConsentOpened = true;
	getEl('play_ad_button').classList.add('button-loading');
	document.body.classList.add('ad-consent');
	hideChannelName();
	prepareAd();
}

function hideRewardedAdConsent() {
	bAdConsentOpened = false;
	document.body.classList.remove('ad-consent');
}

function stopAdsPremium() {
	hideRewardedAdConsent();
	disableAdsPremium();
	adFinishCallback();
	pickPlaylistSelector(oPlaylistNavSelector.firstElementChild, true);

	if( typeof(remoteStopAdsPremium) === 'function' ) {
		remoteStopAdsPremium();
	}
}

function playAd() {

	if( !bAdReady ) {
		showModal(getLang('adNotReadyYet'));
		return false;
	}

	hideRewardedAdConsent();

	if( typeof(remotePlayAd) === 'function' ) {
		remotePlayAd(); return true;
	}

	if( bAllowAds ) {
		if( sDeviceFamily === 'Android' && typeof(m3uConnector.displayAdmobAd) === 'function' ) {
			m3uConnector.displayAdmobAd(); return true;
		}
	}

	// Fallback = no add
	adWasCanceled("The ad server is currently unavailable. Please try again later.");

}

function adFinishCallback() {
	bShowAd = false;
	showChannelName();
	loadAndPlayChannelUrl();

	if( typeof(remoteAdFinishCallback) === 'function' ) {
		remoteAdFinishCallback();
	}
}


function adWasCanceled( sReason ) {
	hideRewardedAdConsent();
	disableAdsPremium();
	bShowAd = false;
	showModal('Ad Premium was aborted. Reason: ' + sReason + '. To proceed, please activate Ads Premium again in the settings.');
	adFinishCallback();

	if( typeof(remoteAdCanceled) === 'function' ) {
		remoteAdCanceled(sReason);
	}
}


function isReadyForPlay() {
	return (localStorage.getItem('bReadyForPlay') === "1");
}


function bootPlayerView() {
	//applyLang();
	// Load only user language
	applyUserLang(); // applyLang() inside
	bootEverything();
}


function premiumTrialEnded() {

	var sType = getLicenseType();
	if( sType === 'Premium Upgrade' || sType === 'Premium' || !aLoadedPlaylists ) {
		return false;
	}

	// Check playlist
	var iFirstPlaylistId = parseInt(Object.keys(aLoadedPlaylists)[0]);

	if( iCurrentPlaylistId != iFirstPlaylistId ) {
		//iCurrentPlaylistId = iFirstPlaylistId;
		showModal(getLang('free-trial-ended')); return true;
	}

	if( aArchiveData ) {
		showModal(getLang('free-trial-ended')); return true;
	}

	return false;

}


function clockTimer() {
	var oDateNow = new Date();
	var sTime = getTimeString(oDateNow, null);
	oClock.innerHTML = sTime;
	return Date.now();
}

function initClock() {

	if( AppSettings.isActive('clock-always-visible') ) {
		oClock.classList.add('force-visible');
	}

	b24HoursClock = AppSettings.isActive('clock-24-hours');

	switch( AppSettings.getSetting('clock-position') ) {
		case 'Bottom Left': oClock.classList.add('bottom-left'); break;
		case 'Top Left': oClock.classList.add('top-left'); break;
		case 'Bottom Right': oClock.classList.add('bottom-right'); break;
		case 'Top Right':
		default: oClock.classList.add('top-right');
	}

	var sClockSize = AppSettings.getSetting('clock-size');
	if( sClockSize ) {
		oClock.style.fontSize = sClockSize;
	}

	var bIsPremiumLicense = (getLicenseType() === 'Premium');
	if( !bIsPremiumLicense ) {
		iTrialSecondsLeft = localStorage.getItem('iTrialPremiumTime');
		iSecondsUntilAd = localStorage.getItem('iSecondsUntilAd');

		if( iTrialSecondsLeft ) {
			iTrialSecondsLeft = parseInt(iTrialSecondsLeft);
		} else { iTrialSecondsLeft = 0; }

		if( iSecondsUntilAd ) {
			iSecondsUntilAd = parseInt(iSecondsUntilAd);
		} else { iSecondsUntilAd = 5; }
	}

	var iLastTs = clockTimer();
	setInterval(function() {
		var iCheckTs = clockTimer();
		if( (iCheckTs - iLastTs) > 3600000 ) {
			epgTryLoading(); // Samsung needs it after resume - in case the interval is paused in background
		}
		iLastTs = iCheckTs;

		if( !bIsPremiumLicense && !bShowAd ) {
			if( bAdsPremiumActive ) {
				if( iSecondsUntilAd < 1 ) {
					iSecondsUntilAd = 3600;
					//prepareAd();
					setAdOnChannelSwitch();
				} else {
					iSecondsUntilAd -= 5;
					localStorage.setItem('iSecondsUntilAd', iSecondsUntilAd);
				}
			} else if( iTrialSecondsLeft > 0 ) {
				iTrialSecondsLeft -= 5;

				if( iTrialSecondsLeft > 0 ) {
					localStorage.setItem('iTrialPremiumTime', iTrialSecondsLeft);
				} else {
					if( premiumTrialEnded() ) {
						//setActivePlaylist(iCurrentPlaylistId);
						pickPlaylistSelector(oPlaylistNavSelector.firstElementChild, true);
					}
					localStorage.removeItem('iTrialPremiumTime');
					iTrialSecondsLeft = 0;
				}
			}
		}

		iSecondsSinceEpgNavListRefresh += 5;
		iSecondsSinceEpgOverviewRefresh += 5;
		iSecondsSinceEpgChannelRefresh += 5;
		// Wenn Übersicht geöffnet, dann jede Minute Tabelle aktualisieren
		/*if( bEpgOverviewOpened && iSecondsSinceEpgOverviewRefresh > 120 ) {
			refreshEpgOverviewTable();
		}*/

		if( bNavOpened && (iSecondsSinceEpgNavListRefresh > 60 || bEpgDownloadRunning) ) {
			refreshEpgNavList();
		}

		if( sLoadingFromDb && iSecondsSinceEpgChannelRefresh > 15 ) {
			//sLoadingFromDb = false;
			iSecondsSinceEpgChannelRefresh = 0;
			updateChannelNameEpg();
		}

		if( bPlaying && (sVideoType == 'vod' || sVideoType == 'series') ) {
			var iCurrentTime = getCurrentPlayedTime();
			if( iCurrentTime && iPlayingXtreamId ) {
				setWatchedXtreamTime(iCurrentTime, iPlayingXtreamId, sVideoType, iCurrentPlaylistId);
			}
		}

	}, 5000);

	// Archive
	setInterval(function() {
		iUtcArchiveStarted++;
		iArchiveCurrentTime++;
	}, 1000);

}