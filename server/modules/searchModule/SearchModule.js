APP.SearchModule = (function(){

    var _ref = this;

    this.init = function(){
        APP.services.SearchService = new APP.SearchService();
    }

    return this;

});
