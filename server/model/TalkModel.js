APP.TalkModel = function(){

    var _ref = this;

    this.islistening = false;

    this.wordsToIgnore = 'le la les des de sa son se un une mes me ma mon'.split(' ');

    // BDD TABLES
    this.CATEGORY_INFOS_LEARNING = [
        {
            id: 'gotName',
            type: 'learn',
            nameTable: 'personnages',
            questions: ['Comment tu tappel ?'],
            confirm: ['Tu tappel {0}. Tu confirmes ?'],
            answers: ['Tu tappel {0}'],
            wordsToIgnore: 'appel m\'appel'
        },
        {
            id: 'gotLike',
            type: 'learn',
            nameTable: 'personnages_like',
            questions: ['{name} quest ce que tu aimes ?'],
            confirm: ['Tu aimes {0}. Tu confirmes ?'],
            answers: ['Je te connais un peu {name}. Tu aimes {0}'],
            wordsToIgnore: 'aime j\'aime adore j\'adore'
        },
        {
            id: 'gotWord',
            type: 'learn',
            nameTable: 'words',
            questions: ['Quest ce que {0} ?'],
            confirm: ['C\'est {0}. Tu confirmes ?'],
            answers: ['C\'est {0}'],
            wordsToIgnore: ''
        }
    ];


    this.LISTENING_WORDS_TALK = [
        {
            id: 'talk_1',
            keyWords: 'salut',
            type: 'talk',
            answer: ['Salut'],
            initiativesNoName: ['gotName'],
            initiatives: ['gotLike', 'gotWord']
        },
        {
            id: 'talk_2',
            keyWords: 'comment tu t\'appel',
            type: 'talk',
            answer: ['Je m\'appel Liya'],
            initiativesNoName: ['gotName'],
            initiatives: ['gotLike', 'gotWord']
        },
        {
            id: 'talk_3',
            keyWords: 'qui es tu',
            type: 'talk',
            answer: ['je suis une intelligence artificiel créé par Michel Pereira.'],
            initiativesNoName: ['gotName'],
            initiatives: ['gotLike', 'gotWord']
        }
    ];

    this.getProcessLearning = function(id){
        var ret;
        var nb = _ref.CATEGORY_INFOS_LEARNING.length;
        for (var i = 0; i < nb; i++) {
            if(_ref.CATEGORY_INFOS_LEARNING[i].id == id){
                ret = _ref.CATEGORY_INFOS_LEARNING[i];
            }
        }
        return ret;
    };

    this.getRandomInitiative = function(process, nameClient){
        var index;
        var processLearning;

        if(nameClient) {
            index = Math.floor(Math.random() * process.initiatives.length);
            processLearning = APP.services.RobotModel.getProcessLearning(process.initiatives[index]);
        }else{
            index = Math.floor(Math.random() * process.initiativesNoName.length);
            processLearning = APP.services.RobotModel.getProcessLearning(process.initiativesNoName[index]);
        }

        return processLearning;
    };
    this.getQuestionsRandom = function(processLearning, nameClient){
        var ret = processLearning.questions[0];

        if(nameClient){
            ret = ret.replace('{name}', nameClient);
        }
        switch (processLearning.id){
            case 'gotWord':
                ret = ret.replace('{0}', 'oiseau');
                break;
        }

        return ret;
    };
    return this;

};
