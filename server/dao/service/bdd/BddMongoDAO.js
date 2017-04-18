APP.BddMongoDAO = function(){

    console.log("APP.BddMongoDAO");

    this.db = null;
    var _ref = this;
    var MONGO_CLIENT = {
        IP: '192.168.0.18',
        PORT: 27017,
        DATABASE: 'lia',
        PASS: ''
    };

    this.init = function(){
        console.log("APP.BddMongoDAO init");

        var MongoClient = require("mongodb").MongoClient;
        MongoClient.connect("mongodb://" + MONGO_CLIENT.IP + ":" + MONGO_CLIENT.PORT + "/" + MONGO_CLIENT.DATABASE, function(error, db) {
            if (error) {
                console.log("error " + error);
                return;
            }
            console.log("Connecté à la base de données 'lia'");

            _ref.db = db;


            var objNew = {
                name: 'Michel',
                datas: {
                    cat: 'gege',
                    cat2: 'test r'
                }
            };

            //db.collection("personnages").update({name: 'Michel'}, objNew);

            var objToFind     = { name: 'Michel' };

            db.collection("personnages").findOne(objToFind, function(error, result) {
                if (error) throw error;

                console.log(result);

            });

        });
    };

    this.init();

    return this;

};
