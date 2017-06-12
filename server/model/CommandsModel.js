APP.CommandsModel = function(){

    var _ref = this;
    this.wordsToIgnore = 'le la les des de sa son se un une mes me ma mon'.split(' ');

    this.LISTENING_WORDS_ACTION = [];

    this.getCmdFromId = function(idCmd){
        var nb = _ref.LISTENING_WORDS_ACTION.length;
        var i;
        var command;
        for (i = 0; i < nb; i++) {
            if(_ref.LISTENING_WORDS_ACTION[i].id === idCmd){
                command = _ref.LISTENING_WORDS_ACTION[i];
                break;
            }
        }

        return command;
    }

    return this;

};
