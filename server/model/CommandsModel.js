APP.CommandsModel = function(){

    var _ref = this;
    this.islistening = false;
    this.wordsToIgnore = 'le la les des de sa son se un une mes me ma mon'.split(' ');

    this.LISTENING_WORDS_ACTION = [
        {
            id: 'stop',
            keyWords: 'stop||arreter||arrêter',
            type: 'execute',
            dependanciesCommandClasses: {
                'YoutubeModule': APP.StopYoutubeCmd,
                'MusicModule': APP.StopMHardDriveCmd,
                'SoundcloudModule': APP.StopSoundcloudCmd,
                'SearchModule': APP.StopTalkCmd
            }
        },
        {
            id: 'next',
            keyWords: 'suivant',
            type: 'execute',
            dependanciesCommandClasses: {
                'YoutubeModule': APP.NextYoutubeCmd,
                'MusicModule': APP.NextMHardDriveCmd,
                'SoundcloudModule': APP.NextSoundcloudCmd
            }
        },
        {
            id: 'prev',
            keyWords: 'précédent',
            type: 'execute',
            dependanciesCommandClasses: {
                'YoutubeModule': APP.PrevYoutubeCmd,
                'MusicModule': APP.PrevMHardDriveCmd,
                'SoundcloudModule': APP.PrevSoundcloudCmd
            }
        },
        {
            id: 'random',
            keyWords: 'suivant aléatoire',
            type: 'execute',
            dependanciesCommandClasses: {
                'YoutubeModule': APP.RandomYoutubeCmd,
                'MusicModule': APP.RandomMHardDriveCmd,
                'SoundcloudModule': APP.RandomSoundcloudCmd
            }
        },
        {
            id: 'current_title',
            keyWords: 'titre en cours de lecture',
            type: 'execute',
            dependanciesCommandClasses: {
                'MusicModule': APP.GetTitleMHardDriveCmd,
                'SoundcloudModule': APP.GetTitleSoundcloudCmd
            }
        },
        {
            id: 'volume_up',
            keyWords: 'monte le son',
            type: 'execute',
            commandClasses: [APP.UpVolumeCmd]
        },
        {
            id: 'volume_down',
            keyWords: 'baisse le son',
            type: 'execute',
            commandClasses: [APP.DownVolumeCmd]
        },
        {
            id: 'youtube',
            keyWords: 'cherche musique',
            type: 'execute',
            module: 'YoutubeModule',
            commandClasses: [APP.SearchOnYoutubeCmd]
        },
        {
            id: 'youtube_playlist_80',
            keyWords: 'lance playlist années 80',
            type: 'execute',
            playlist_title: 'Playlist Années 80.',
            playlist_watch: 'https://www.youtube.com/watch?v=E-8dsWrjC5U&list=PLxJ9pieZcILmr8tjdX_txzNyBl1Nl-TaU&index=',
            playlist: 'https://www.youtube.com/playlist?list=PLxJ9pieZcILmr8tjdX_txzNyBl1Nl-TaU',
            module: 'YoutubeModule',
            commandClasses: [APP.SearchOnYoutubeCmd]
        },
        {
            id: 'youtube_playlist_michel',
            keyWords: 'lance playlist Michel||michelle||michel',
            type: 'execute',
            playlist_title: 'Playlist Michel.',
            playlist_watch: 'https://www.youtube.com/watch?v=-UJX0QpkhhU&list=PLxJ9pieZcILmY8hOLcQESmT_9ViE8OjRO&index=1',
            playlist: 'https://www.youtube.com/playlist?list=PLxJ9pieZcILmY8hOLcQESmT_9ViE8OjRO',
            module: 'YoutubeModule',
            commandClasses: [APP.SearchOnYoutubeCmd]
        },
        {
            id: 'temperature',
            keyWords: 'donne||donne-moi température',
            type: 'execute',
            module: 'TemperatureModule',
            commandClasses: [APP.GetTemperaturesCmd]
        },
        {
            id: 'temperature_ext',
            keyWords: 'température extèrieur||exterieur||extérieur',
            type: 'execute',
            module: 'TemperatureModule',
            commandClasses: [APP.GetTemperatureExtCmd]
        },
        {
            id: 'temperature_int',
            keyWords: 'température intèrieur||interieur||intérieur',
            type: 'execute',
            module: 'TemperatureModule',
            commandClasses: [APP.GetTemperatureIntCmd]
        },
        {
            id: 'light_on_saloon',
            keyWords: 'allumer||allume lumières salon',
            type: 'execute',
            cmd: ['sudo /home/pi/rcswitch-pi/./send 11111 4 1'],
            successAnswer: 'Lumière salon allumée',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'light_off_saloon',
            keyWords: 'éteint||éteins lumières salon',
            type: 'execute',
            cmd: ['sudo /home/pi/rcswitch-pi/./send 11111 4 0'],
            successAnswer: 'Lumière salon étainte',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'light_on_bureau',
            keyWords: 'allumer||allume lumières bureau',
            type: 'execute',
            cmd: ['sudo /home/pi/rcswitch-pi/./send 11111 2 1'],
            successAnswer: 'Lumière bureau allumé',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'light_off_bureau',
            keyWords: 'éteint||éteins lumières bureau',
            type: 'execute',
            cmd: ['sudo /home/pi/rcswitch-pi/./send 11111 2 0'],
            successAnswer: 'Lumière bureau étainte',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'light_on_entrée',
            keyWords: 'allumer lumières entrer||entrée',
            type: 'execute',
            cmd: ['sudo /home/pi/rcswitch-pi/./send 11111 3 1'],
            successAnswer: 'Lumière entrée allumée',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'light_off_entrée',
            keyWords: 'éteint||éteins lumières entrer entrée',
            type: 'execute',
            cmd: ['sudo /home/pi/rcswitch-pi/./send 11111 3 0'],
            successAnswer: 'Lumière entrée étainte',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'light_on_all',
            keyWords: 'allumer||allume toutes lumières',
            type: 'execute',
            cmd: ['sudo /home/pi/rcswitch-pi/./send 11111 3 1 && sudo /home/pi/rcswitch-pi/./send 11111 2 1 && sudo /home/pi/rcswitch-pi/./send 11111 4 1'],
            successAnswer: 'Lumière allumée',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'light_off_all',
            keyWords: 'éteint||éteins toutes lumières',
            type: 'execute',
            cmd: ['sudo /home/pi/rcswitch-pi/./send 11111 3 0 && sudo /home/pi/rcswitch-pi/./send 11111 2 0 && sudo /home/pi/rcswitch-pi/./send 11111 4 0'],
            successAnswer: 'Lumière étainte',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'son_on_télé',
            keyWords: 'met active le son',
            type: 'execute',
            cmd: ['sudo /home/pi/rcswitch-pi/./send 11111 1 1'],
            successAnswer: 'son activé',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'son_off_télé',
            keyWords: 'coupe le son',
            type: 'execute',
            cmd: ['sudo /home/pi/rcswitch-pi/./send 11111 1 0'],
            successAnswer: 'son désactivé',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'musique_mp3',
            keyWords: 'lance playlist patrice',
            type: 'execute',
            cmd: ['mocp -s && mocp -c && mocp -a /data/Musiques/Patrice.m3u && mocp -p'],
            successAnswer: 'votre playlist est en cours de lecture',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'musique_playlist_bleu',
            keyWords: 'lance playlist bleu::bleue',
            type: 'execute',
            cmd: ['mocp -s && mocp -c && mocp -a /data/Musiques/Bleue.m3u && mocp -o shuffle && mocp -p'],
            successAnswer: 'La playlist bleue est en cours de lecture',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'musique_mp3',
            keyWords: 'lecture aléatoire',
            type: 'execute',
            cmd: ['mocp -o shuffle'],
            successAnswer: 'lecture aléatoire activée',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'musique_mp3',
            keyWords: 'désactive||desactiver||désactiver aléatoire',
            type: 'execute',
            cmd: ['mocp -u shuffle'],
            successAnswer: 'lecture aléatoire désactivée',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'musique_mp3',
            keyWords: 'avance',
            type: 'execute',
            cmd: ['mocp -k 30'],
            successAnswer: '',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'musique_mp3',
            keyWords: 'met sur pause',
            type: 'execute',
            cmd: ['mocp -P'],
            successAnswer: '',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'musique_mp3',
            keyWords: 'reprend la musique',
            type: 'execute',
            cmd: ['mocp -U'],
            successAnswer: '',
            commandClasses: [APP.ExecuteCmd]
        },
        {
            id: 'music',
            keyWords: 'lance musique',
            type: 'execute',
            module: 'MusicModule',
            commandClasses: [APP.SearchMHardDriveCmd]
        },
        {
            id: 'searchWeb',
            keyWords: 'dis-moi quel||ou||qu||qui||qu\'est-ce',
            type: 'execute',
            module: 'SearchModule',
            commandClasses: [APP.SearchOnWebCmd]
        },
        {
            id: 'searchWeb',
            keyWords: 'donne-moi||donnes-moi des infos||info||informations sur',
            type: 'execute',
            module: 'SearchModule',
            commandClasses: [APP.SearchOnWebCmd]
        },
        {
            id: 'searchWeb',
            keyWords: 'fais une recherche sur',
            type: 'execute',
            module: 'SearchModule',
            commandClasses: [APP.SearchOnWebCmd]
        },
        {
            id: 'standby',
            keyWords: 'mets-toi||mets||met en veille',
            type: 'execute',
            commandClasses: [APP.StandbySnowboyCmd]
        },
        {
            id: 'getNews',
            keyWords: 'informations||info du jour',
            type: 'execute',
            module: 'SearchModule',
            commandClasses: [APP.GetNewsCmd]
        },
        {
            id: 'robot_turnArround',
            keyWords: 'tourne toi||tourne-toi',
            type: 'execute',
            module: 'RobotModule',
            commandClasses: [APP.TurnArroundRobotCmd]
        },
        {
            id: 'robot_turnArround',
            keyWords: 'fais demi tour||demi-tour',
            type: 'execute',
            module: 'RobotModule',
            commandClasses: [APP.TurnArroundRobotCmd]
        },
        {
            id: 'time',
            keyWords: 'quel||quelle heure est il||t\'il',
            type: 'execute',
            commandClasses: [APP.GetTimeCmd]
        },
        {
            id: 'time',
            keyWords: 'donne moi heure||l\'heure',
            type: 'execute',
            commandClasses: [APP.GetTimeCmd]
        },
        {
            id: 'date',
            keyWords: 'quel||quelle jour on es||est',
            type: 'execute',
            commandClasses: [APP.GetDateCmd]
        },
        {
            id: 'date',
            keyWords: 'on||nous est||es||sommes quel||quelle jour',
            type: 'execute',
            commandClasses: [APP.GetDateCmd]
        },
        {
            id: 'date',
            keyWords: 'donne moi la date du jour',
            type: 'execute',
            commandClasses: [APP.GetDateCmd]
        },
        {
            id: 'soundcloud',
            keyWords: 'cherche soundcloud',
            type: 'execute',
            module: 'SoundcloudModule',
            commandClasses: [APP.SearchOnSoundCloudCmd]
        },
        {
            id: 'soundcloud_michel',
            keyWords: 'lance soundcloud michel',
            type: 'execute',
            userTracks: '/users/8714838/tracks',
            module: 'SoundcloudModule',
            commandClasses: [APP.SearchOnSoundCloudCmd]
        }
    ];

    return this;

};
