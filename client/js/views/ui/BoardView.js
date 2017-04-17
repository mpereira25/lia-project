APP.BoardView = function(container){


    var _ref = this;
    var jaugeBatery = $(container.find('.jaugeBatery')[0]);
    var jaugeBateryBefore = jaugeBatery.find('div');
    var voltText = $(container.find('.voltText')[0]);


    this.changeVoltage = function(percent){

        //console.log('changeVoltage ' + percent);
        var value = '' + percent * 12;
        if(value.length > 4){
            value = value.substr(0, 4);
        }
        percent = Math.max(0, (value-5.5) / (12-5.5));
        voltText.html(value + ' V');
        jaugeBateryBefore.css('width', parseInt((percent)*100) + '%');
    };
    this.changeVoltageLow = function(percent){
        jaugeBatery.removeClass('critical');
        jaugeBatery.addClass('low');
        var value = '' + percent * 12;
        if(value.length > 4){
            value = value.substr(0, 4);
        }
        voltText.html(value + ' V');
        jaugeBateryBefore.css('width', parseInt(percent*100) + '%');
    };
    this.changeVoltageCritical = function(percent){
        jaugeBatery.removeClass('low');
        jaugeBatery.addClass('critical');
        var value = '' + percent * 12;
        if(value.length > 4){
            value = value.substr(0, 4);
        }
        percent = Math.max(0, (value-5.5) / (12-5.5));
        voltText.html(value + ' V');
        jaugeBateryBefore.css('width', parseInt(percent*100) + '%');
    };
    this.changeVoltageNormal = function(percent){
        jaugeBatery.removeClass('low');
        jaugeBatery.removeClass('critical');
        var value = '' + percent * 12;
        if(value.length > 4){
            value = value.substr(0, 4);
        }
        percent = Math.max(0, (value-5.5) / (12-5.5));
        voltText.html(value + ' V');
        jaugeBateryBefore.css('width', parseInt(percent*100) + '%');
    };

    return this;
};