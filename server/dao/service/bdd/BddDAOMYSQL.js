APP.BddDAOMYSQL = function(){

    console.log("APP.BddDAO");

    this.callBacks;

    var mysql = require('mysql');
    var _ref = this;

    var connection = mysql.createConnection({
        host     : '192.168.0.10',
        user     : 'lia',
        password : '',
        database : 'lia',
        port : 3306
    });


    this.init = function(){
        console.log("APP.BddDAO init");


        // the callback inside connect is called when the connection is good
        connection.connect(function(err){
            if (err) return console.log("Error " + err);
            console.log("connected to the base");
        });
    };

    this.execute = function(table, where, callback){


        // SELECT
        var sql = "SELECT * FROM " + table + " " + where;
        console.log(' QUERY ' + sql);
        connection.query(sql, function(err, rows, fields) {
            if (err) return console.log("Error " + err);

            var datas = [];
            var obj;
            var i = 0;
            var nb = rows.length;
            if(rows && rows.length > 0){
                switch(table){
                    case APP.services.RobotModel.TABLE_WORDS_WAKE:
                        for (i = 0; i < nb; i++) {
                            obj = {};
                            obj.words = rows[i].words;
                            datas.push(obj);
                        }
                        break;
                    case APP.services.RobotModel.TABLE_ANSWER_WAKE:
                        for (i = 0; i < nb; i++) {
                            obj = {};
                            obj.words = rows[i].words;
                            //obj.type = rows[i].type;
                            //obj.rank = rows[i].rank;
                            datas.push(obj);
                        }
                        break;
                    case APP.services.RobotModel.TABLE_LEARN:
                        for (i = 0; i < nb; i++) {
                            obj = {};
                            obj.words = rows[i].words;
                            obj.type = rows[i].type;
                            obj.rank = rows[i].rank;
                            datas.push(obj);
                        }
                        break;
                    case APP.services.RobotModel.TABLE_PERSON:
                        for (i = 0; i < nb; i++) {
                            obj = {};
                            obj.name = rows[i].name;
                            obj.info = rows[i].info;
                            obj.type = rows[i].type;
                            obj.rank = rows[i].rank;
                            datas.push(obj);
                        }
                        break;
                    case APP.services.RobotModel.TABLE_OBJECT:
                        for (i = 0; i < nb; i++) {
                            obj = {};
                            obj.name = rows[i].name;
                            obj.info = rows[i].info;
                            obj.type = rows[i].type;
                            obj.rank = rows[i].rank;
                            datas.push(obj);
                        }
                        break;
                }
            }
            if(datas && callback){
                callback('QUERY_RESULT', datas);
            }

        });

    };
    this.save = function(table, obj, callback){

        // INSERT
        var sql = "INSERT INTO `" + table + "`(`name`, `info`, `rank`) VALUES ('" + obj.name + "','" + obj.info + "',0)";
        console.log(' INSERT ' + sql);
        connection.query(sql, function(err) {
            if (err) return console.log("Error " + err);

            if(callback){
                callback('INSERT_RESULT');
            }
        });
    };

    this.init();

    return this;

};
