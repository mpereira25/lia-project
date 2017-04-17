/**
 * Created by stellar on 03/04/2016.
 */
APP.TalkController = function(pSocketController){

    var socketController = pSocketController;
    var speechSynth = false;
    var msgSynth;
    var voices;
    var _ref = this;

    this.alwaysListening = false;

    function init(){
        console.log("init TalkController");
        socketController.addEventListener(socketController.ON_TALK, function(event, msg, param){
            _ref.onCallBackSocketTalk(msg, param);
        }, _ref);

        try{
            msgSynth = new SpeechSynthesisUtterance();
            msgSynth.onstart = function(event){
                _ref.stop();
            };
            msgSynth.onend = function(event){
                if(_ref.alwaysListening){
                    _ref.start();
                }
            };

            var flag = false;
            window.speechSynthesis.onvoiceschanged = function(){
                if(!flag){
                    flag = true;
                    voices = window.speechSynthesis.getVoices();
                    msgSynth.lang = 'fr-FR';
                    speechSynth = true;
                }

            };
            window.speechSynthesis.getVoices();

        }catch(e){

        }

        if (annyang) {
            // Let's define our first command. First the text we expect, and then the function it should call
            var commands = {
               /* 'bleu': function() {
                    $('body').css('background-color', "#0000ff");
                },
                'rouge': function() {
                    $('body').css('background-color', "#ff0000");
                },
                'vert': function() {
                    $('body').css('background-color', "#00ff00");
                },
                'jaune': function() {
                    $('body').css('background-color', "#88ff00");
                },
                'salut': function() {
                    _ref.speech("Salut !");
                },
                'salut Liya': function() {
                    _ref.speech('Salut !');
                },
                'qui es tu': function() {
                    _ref.speech('Je mappel Liya, je suis une intelligence artificiel créé par Michel Pereira.');
                },
                'comment tu tappel': function() {
                    _ref.speech('Je mappel Liya, je suis une intelligence artificiel créé par Michel Pereira.');
                },
                'qui est ton créateur': function() {
                    _ref.speech('Mon créateur est Michel Pereira.');
                },
                'go': function() {
                    socketController.motion(APP.SOCKET_MESSAGE.UP);
                },
                'droite': function() {
                    socketController.motion(APP.SOCKET_MESSAGE.LEFT);
                },
                'gauche': function() {
                    socketController.motion(APP.SOCKET_MESSAGE.RIGHT);
                },
                'stop': function() {
                    socketController.motion(APP.SOCKET_MESSAGE.STOP);
                }*/
            };

            annyang.addCallback('resultNoMatch', function(userSaid, commandText, phrases) {
                if(!_ref.alwaysListening){
                    _ref.stop();
                }
                _ref.talk(userSaid.toString().toLowerCase());

            });


            // Add our commands to annyang
            annyang.setLanguage("fr-FR");
            annyang.addCommands(commands);


        }
    };
    this.talk = function(msg){
        msg = msg.toLowerCase();
        console.log('userSaid ' + msg);

        socketController.talk(APP.SOCKET_MESSAGE.TALK, msg);
    };
    this.onCallBackSocketTalk = function(msg, param){
        console.log('robot > ' + msg);

        var dontStopListening = false;
        if(param && param === 'true') {
            dontStopListening = true;
        }else{
            _ref.stop();
        }
        //_ref.speech(msg, dontStopListening);

    };
    this.speech = function(msg, dontStopListening){
        console.log('speech ok');
        if(responsiveVoice) {
             responsiveVoice.speak(msg,
                 "French Female",
                 {
                 onstart: function(event){
                     if(!dontStopListening) {
                         _ref.stop();
                     }
                 },
                 onend: function(event){
                     if(_ref.alwaysListening){
                        _ref.start();
                     }
                     socketController.talk(APP.SOCKET_MESSAGE.TALK_END, 'TALK_END');
                 }

             });
         }else{
            if(_ref.alwaysListening){
                _ref.start();
            }
         }

        /*if(speechSynth == true){
         msgSynth.text = msg;
         window.speechSynthesis.speak(msgSynth);
         }*/

    };

    this.stopSpeech = function(){
      if(responsiveVoice) {
           responsiveVoice.cancel();
           if(_ref.alwaysListening){
              _ref.start();
           }
       }
    }

    this.start = function(){
        if(annyang && !annyang.isListening()){
            // Start listening. You can call this here, or attach this call to an event, button, etc.
            annyang.start();
        }

    };
    this.stop = function(){
        if(annyang && annyang.isListening()){
            annyang.abort();
        }

    };

    init();

    return this;
};
