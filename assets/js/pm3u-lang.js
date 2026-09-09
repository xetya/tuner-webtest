/*

// en, ar, cs, da, de, el, es, fi, fr, hi, id, it, ja, ka, ko, nl, no, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi, zh

var i18n = {

"yes": {
	en: "yes"
},
"no": {
	en: "no"
},
"close-app-hint": {
	en: "Do you want to close this app?"
},
"hide-modal-hint": {
	en: "Press any button to close this message."
},
"filterNoResults": {
	en: "No channels found for the given filter."
},
"noChannelsInFavGroup": {
	en: "No visible channels in this favorite group."
},
"noGroupsInFavGroup": {
	en: "No groups in your selected favorites."
},
"addFavsFirst": {
	en: "Please create a favorite group first."
},
"noChannelsHere": {
	en: "No channels here yet."
},
"notSelected": {
	en: "not selected"
},
"programs": {
	en: "Programs"
},
"free-trial-ended": {
	en: "Your free trial ended. If you like the functions, please upgrade to Premium version to unlock them.<br>Learn more at: https://m3u-ip.tv"
},
"license-fail": {
	en: "This function is not available with the Free version. Upgrade to a Premium version to unlock it.<br>Learn more at: https://m3u-ip.tv"
},
"license-archive-play-fail": {
	en: "Archive content is not available with the Free version. Upgrade to a Premium version to unlock archive access.<br>Please note: archive support must also be provided by your IPTV provider.<br>Learn more at: https://m3u-ip.tv"
},
"enableMobileAdsPremium": {
	en: "You can now unlock Premium access by watching ads. Do you want to enable ads now?"
},
"redButtonHint": {
	en: "<span class=\"red-button\">A</span> search"
},
"connectionUnstableError": {
	en: "Connection is unstable. Trying to recover…"
},
"dataBrokenError": {
	en: "Received data from the server is corrupted. If the issue persists, contact your IPTV provider."
},
"connectionLost": {
	en: "Network connection lost. Please check your network."
},
"channelLoadError": {
	en: "This channel is not available at the moment. Please try again later."
},
"channelLoadConnectionFailed": {
	en: "(Connection to the stream failed.)"
},
"channelNotSupportedFile": {
	en: "This channel cannot be loaded due to an incompatible format."
},
"errorNoFavouritesYet": {
	en: "You don't have any favorite channels yet. Press the YELLOW button to favorite a channel."
},
"search": {
	en: "Search"
},
"recentlyWatched": {
	en: "Recently watched"
},
"allChannels": {
	en: "All channels"
},
"favourites": {
	en: "⭐ Favorites"
},
"favorites": {
	en: "Favorites"
},
"playlistFavorites": {
	en: "Playlist favorites"
},
"globalFavorites": {
	en: "Global favorites"
},
"editFavGroups": {
	en: "Edit favorites"
},
"liveTv": {
	en: "Live TV"
},
"movies": {
	en: "Movies"
},
"series": {
	en: "Series"
},
"groups": {
	en: "Groups"
},
"channels": {
	en: "Channels"
},
"settings": {
	en: "Settings"
},
"epg": {
	en: "EPG"
},
"guide": {
	en: "Guide"
},
"controls": {
	en: "Controls"
},
"playlist": {
	en: "Playlist"
},
"playlists": {
	en: "Playlists"
},
"loading": {
	en: "Loading...",
	ar: "جار التحميل...",
	cs: "Načítání...",
	da: "Indlæser...",
	de: "Lädt...",
	el: "Φόρτωση...",
	es: "Cargando...",
	fi: "Ladataan...",
	fr: "Chargement...",
	hi: "लोड हो रहा है...",
	id: "Memuat...",
	it: "Caricamento...",
	ja: "読み込み中...",
	ka: "იტვირთება...",
	ko: "로딩 중...",
	nl: "Laden...",
	no: "Laster...",
	pl: "Ładowanie...",
	pt: "Carregando...",
	ro: "Se încarcă...",
	ru: "Загрузка...",
	sk: "Načítava sa...",
	sl: "Nalagam...",
	sv: "Läser in...",
	tr: "Yükleniyor...",
	uk: "Завантаження...",
	vi: "Đang tải...",
	zh: "加载中..."
},
"audioTrack": {
	en: "Audio track"
},
"videoTrack": {
	en: "Video track"
},
"subtitleTrack": {
	en: "Subtitle track"
},
"brightness": {
	en: "Brightness"
},
"channelSettings": {
	en: "Channel settings"
},
"channelSettingSubtitle": {
	en: "Subtitle / Audio"
},
"channelSettingAudio": {
	en: "Audio"
},
"channelSettingVideo": {
	en: "Video / Format"
},
"channelSettingFavs": {
	en: "Add to Favorites"
},
"channelEdit": {
	en: "Edit channel"
},
"channelSettingPlayback": {
	en: "Show playback controls"
},
"channelSettingAudioDefault": {
	en: "Default track"
},
"channelSettingSubNoTrack": {
	en: "Not available"
},
"channelSettingSubOff": {
	en: "Disable"
},
"channelSettingResolution": {
	en: "Resolution"
},
"channelSettingFormat": {
	en: "Video format"
},
"channelSettingFormatOriginal": {
	en: "Original"
},
"channelSettingFormatFill": {
	en: "Fill / stretch"
},
"channelSettingFormatZoom": {
	en: "Zoom"
},
"epg-quota-exceeded-error": {
	en: "Not enough free space to save EPG data. Please free up some space. For example by deleting not used apps."
},
"noEpgForChannel": {
	en: "No EPG for this channel"
},
"epgNow": {
	en: "Now"
},
"epgAfter": {
	en: "After"
},
"downloading": {
	en: "Downloading..."
},
"downloadingPlaylist": {
	en: "Downloading playlist"
},
"channels-processed": {
	en: "Channels: "
},
"programs-processed": {
	en: "Programs: "
},
"queued": {
	en: "In queue"
},
"deleting": {
	en: "Deleting"
},
"deleting-expired": {
	en: "Deleting expired programs"
},
"downloading-file": {
	en: "Downloading file"
},
"extracting-file": {
	en: "Extracting file"
},
"epg-download-running": {
	en: "TV guide (EPG) is downloading. Please try again in a moment."
},
"noPlaylistYet": {
	en: "You do not have playlists yet. Add a playlist below."
},
"noPlaylistName": {
	en: "--(no playlist name)--"
},
"playlistSelectorOpenPm": {
	en: "Add/edit playlists"
},
"context-rename": {
	en: "Rename"
},
"context-move": {
	en: "Move"
},
"context-protect": {
	en: "Protect"
},
"context-delete": {
	en: "Delete"
},
"no-password-yet": {
	en: "Set a channel password in Settings to use this feature."
},
"toggle-protection": {
	en: "Unlock/Lock channel protection"
},
"unlock-protection": {
	en: "Enter protection password"
},
"enter-password": {
	en: "Enter your password"
},
"smart-close": {
	en: "Close"
},
"smart-channelepg": {
	en: "Channel programs"
},
"smart-epg-prev": {
	en: "Previous program"
},
"smart-epg-next": {
	en: "Next program"
},
"smart-playback": {
	en: "Playback controls"
},
"smart-channellist": {
	en: "Channel list"
},
"smart-channelsettings": {
	en: "Channel settings"
},
"smart-guide": {
	en: "Guide"
},
"smart-togglesubtitles": {
	en: "Toggle subtitles"
},
"smart-playpause": {
	en: "Pause / Play"
},
"rewardedAdsConsent": {
	en: "Watch another ad to extend Premium access by 1 hour."
},
"playAdButton": {
	en: "▶ Play ad"
},
"stopAdsPremium": {
	en: "Disable Ads Premium"
},
"adNotReadyYet": {
	en: "Ad is not ready yet. Please try again shortly."
},
"xtreamNoContentDescription": {
	en: "No description available for this content."
},
"season": {
	en: "Season"
},
"choose-episode": {
	en: "Choose episode"
},
"doYouLikeTheApp": {
	en: "Do you like the app so far?"
},
"appNotLikeHint": {
	en: "Sorry to hear that. Your feedback helps us improve the app.<br><br>feedback@m3u-ip.tv"
}

};

if( sDeviceFamily === 'Browser' ) {
	i18n.guideControls = {
		en: '<li><kbd>F11</kbd> / double click - Toggle fullscreen</li><li><kbd>M</kbd> - Settings</li><li><kbd>E</kbd> - EPG</li><li><kbd>H</kbd> - User Manual</li><li><kbd>&#8679;</kbd> / mouse-scroll UP - next channel</li><li><kbd>&#8681;</kbd> / mouse-scroll DOWN - previous channel</li><li><kbd>&#8678;</kbd> - open channel list</li><li><kbd>&#8678;</kbd><kbd>&#8678;</kbd> - open group list and other options</li><li><kbd>&#8680;</kbd> - close channel/group list</li><li><kbd>&#9003;</kbd> - play last channel</li><li><kbd>ESC</kbd> - close current operating mask</li>'
	};
}