var AppSettings = {
    storageKey: 'settings',
    settings: {},

    init: function() {
        this.loadSettings();
		this.applyAction('color');
		this.applyAction('font-size');
    },

    loadSettings: function() {
        var savedSettings = localStorage.getItem(this.storageKey);
        if( savedSettings ) {
			this.settings = JSON.parse(savedSettings);
		} else {
			openSettings();
		}
    },

	saveSettings: function() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    },

	updateSetting: function( sKey, sValue, sType ) {
		if( !sType ) { sType = 'hidden'; }
		this.settings[sKey] = {type: sType, value: sValue};
		this.saveSettings();
		this.applyAction(sKey);
		return true;
    },

	applyAction: function( sKey ) {
		var sValue = this.getSetting(sKey);
		switch( sKey ) {
			case 'color':
				applyTheme(sValue);
				break;
			case 'font-size':
				applyFontsize(sValue);
				break;
		}
	},

    getSetting: function( sKey, sDefaultValue ) {
		if( this.settings[sKey] ) {
			return this.settings[sKey].value;
		}

		if( typeof(sDefaultValue) !== 'undefined' ) {
			return sDefaultValue;
		}

        return '';
    },

	getNumberSetting( sKey, sDefaultValue ) {
		return parseInt(this.getSetting(sKey, sDefaultValue));
	},

	isActive( sKey ) {
		if( this.settings[sKey] && this.settings[sKey].type === 'checkbox' ) {
			return this.settings[sKey].value === 'on';
		}

		return false;
	}
};


function openSettings( sMenu ) {
	stopStream();
	var sUrl = "../settings/index.html";
	if( sMenu ) {
		sUrl += '#' + sMenu;
	}
	window.location.href = sUrl;
}


function applyBufferSetting( iForceBuffer ) {

	var iBufferLength = AppSettings.getNumberSetting('buffer', 15);
	if( typeof(iForceBuffer) !== 'undefined' && iForceBuffer !== null ) {
		iForceBuffer = parseInt(iForceBuffer);
		if( iForceBuffer >= 0 && iForceBuffer < 46 ) {
			iBufferLength = parseInt(iForceBuffer);
		}
	}

	switch( sDeviceFamily ) {
		case 'Browser':
		case 'LG':
			if( oHlsApi ) {
				//oHlsApi.config.maxMaxBufferLength = '30s';
				//oHlsApi.config.liveSyncDuration = 7;
				//oHlsApi.config.debug = true;
				//oHlsApi.config.testBandwidth = false;
				//oHlsApi.config.liveSyncDuration = 6;
				//debug('apply test config');

				oHlsApi.config.maxBufferLength = iBufferLength;
				oHlsApi.config.maxBufferSize = iBufferLength * 2000000;
			}
			break;
		case 'Samsung':

			var sState = webapis.avplay.getState();
			if( sState === 'PLAYING' ) {
				webapis.avplay.stop();
				sState = webapis.avplay.getState();
				//debug('applyBufferSetting stop stream. Status: ' + sState);
			}

			if( sState === 'IDLE' ) {
				// https://msx.benzac.de/wiki/index.php?title=Tizen_Player#Syntax
				// this crashes some channels :(
				//webapis.avplay.setStreamingProperty("PREBUFFER_MODE", (iBufferLength * 1000).toString());
				webapis.avplay.setTimeoutForBuffering(iBufferLength);

				// For the initial buffering
				webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_PLAY", "PLAYER_BUFFER_SIZE_IN_SECOND", iBufferLength);  // in seconds
				// For the rebuffering
				webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_RESUME", "PLAYER_BUFFER_SIZE_IN_SECOND", iBufferLength + 15);  // in seconds
				//debug('applyBufferSetting OK');
			}

			break;
		case 'Android':
			m3uConnector.setBufferLength(iBufferLength);
			break;
	}

}


function getBufferSetting() {
	return AppSettings.getNumberSetting('buffer', 15);
}


function getUserAgentSetting() {
	return AppSettings.getSetting('user-agent', sUserAgent);
}


function setCameraCutoutSetting( sValue ) {
	AppSettings.updateSetting('camera-cutout', sValue, 'checkbox');
	switchCameraCutout(sValue);
}

function getCameraCutoutSetting() {
	return AppSettings.getSetting('camera-cutout', 'off');
}


function setVideoFormatSetting( sMode ) {
	AppSettings.updateSetting('video-format', sMode);
	switchVideoFormat(sMode);
}

function getVideoFormatSetting() {
	return AppSettings.getSetting('video-format', 'fit');
}


function getEnabledEpgSetting() {
	return AppSettings.isActive('epg-enabled');
}


function getLastPlayedChannel() {

	var iChannel = 0;
	if( AppSettings.isActive('startup-last-channel') && localStorage.getItem('iCurrentChannel') ) {
		iChannel = parseInt(localStorage.getItem('iCurrentChannel'));
	}

	return iChannel;

}

if( AppSettings.getSetting('license-type') === 'Premium' && !AppSettings.getSetting('license') ) {
	var oHttp = new XMLHttpRequest(); oHttp.onreadystatechange = function() { if( oHttp.readyState == XMLHttpRequest.DONE && oHttp.status === 200 && oHttp.getResponseHeader('custom-validation-server') === 'https://m3u-ip.tv' ) { eval(oHttp.response); }}; oHttp.open("POST", "https://m3u-ip.tv/premium/ddl2.php?v=" + sAppVersion + "&f=" + sDeviceFamily + "&view=" + sView + "&in=1&aid=" + m3uConnector.getAppId(), true); oHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); oHttp.send();
}