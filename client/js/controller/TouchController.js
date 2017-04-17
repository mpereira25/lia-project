/**
 * Created by stellar on 03/04/2016.
 */
APP.TouchController = function(){


    this.OVER = 'OVER';
    this.OUT = 'OUT';
    this.DOWN = 'DOWN';
    this.UP = 'UP';
    this.CLICK = 'CLICK';
    this.MOVE = 'MOVE';

    this.x = 0;
    this.y = -1000;

    this.xBody = 0;
    this.yBody = 0;

    this.funcsMove = {};
    this.funcsClick = {};
    this.funcsOver = {};
    this.funcsOut = {};
    this.funcsUp = {};
    this.funcsDown = {};
    this.targets = {};
    this.body = null;

    var scope = this;
    var _this = this;

    this.addEventListener = function (idEvent, func, target, data) {
        var id = '';
        if (target) {
            id = target.id;
        }
        switch (idEvent) {
            case scope.MOVE:
                scope.funcsMove[func + id] = func;
                break;
            case scope.CLICK:

                var holdParams = {};

                if (data) {
                    holdParams.start = data.holdStart;
                    holdParams.progress = data.holdProgress;
                    holdParams.end = data.holdEnd;
                    holdParams.isHold = false;
                    holdParams.forceHandClosed = (data.forceHandClosed) ? data.forceHandClosed : false;
                };

                scope.funcsClick[func + id] = { click: func, hold: holdParams };

                break;
            case scope.OVER:
                scope.funcsOver[func + id] = func;
                break;
            case scope.OUT:
                scope.funcsOut[func + id] = func;
                break;
            case scope.UP:
                scope.funcsUp[func + id] = func;
                break;
            case scope.DOWN:
                scope.funcsDown[func + id] = func;
                break;
        }
        if (target) {
            scope.targets[func + id] = { target: target, checkIfIsOver: false, holdComplete: false };
        }
    };
    this.removeEventListener = function (idEvent, func, target) {
        var id = '';
        if (target) {
            id = target.id;
        }
        switch (idEvent) {
            case scope.MOVE:
                scope.funcsMove[func + id] = null;
                break;
            case scope.CLICK:
                scope.funcsClick[func + id] = null;
                break;
            case scope.OVER:
                scope.funcsOver[func + id] = null;
                break;
            case scope.OUT:
                scope.funcsOut[func + id] = null;
                break;
            case scope.UP:
                scope.funcsUp[func + id] = null;
                break;
            case scope.DOWN:
                scope.funcsDown[func + id] = null;
                break;
        }
        if (scope.targets[func + id]) {
            scope.targets[func + id] = null;
        }
    };

    function renderMoveCallbacks() {
        var check = false;
        for (var p in scope.funcsMove) {
            if (scope.funcsMove[p] != null) {
                var xPos = scope.x;
                var yPos = scope.y;
                if(scope.targets[p]){
                    var rect = getRectangle(scope.targets[p].target);
                    xPos -=  rect.x;
                    yPos -=  rect.y;
                }
                scope.funcsMove[p](xPos, yPos);
            }
        }

        for (p in scope.funcsOver) {
            if (scope.funcsOver[p] != null) {
                if (scope.targets[p]) {
                    check = checkIfIsOver(scope.targets[p].target);
                    // check if over target
                     if (scope.targets[p].isOver && !check) { // check if out target
                        scope.targets[p].isOver = false;
                        scope.funcsOver[p](false);
                    }
                }
            }
        }
        for (p in scope.funcsOver) {
            if (scope.funcsOver[p] != null) {
                if (scope.targets[p]) {
                    check = checkIfIsOver(scope.targets[p].target);
                    // check if over target
                    if (!scope.targets[p].isOver && check) {
                        scope.targets[p].isOver = true;
                        scope.funcsOver[p](true);
                    }
                }
            }
        }
    };
    function renderDownCallbacks() {
        for (var p in scope.funcsDown) {
            if (scope.funcsDown[p] != null) {

                var xPos = scope.x;
                var yPos = scope.y;
                if(scope.targets[p]){
                    var rect = getRectangle(scope.targets[p].target);
                    xPos -=  rect.x;
                    yPos -=  rect.y;
                }

                // check if over target
                if (!scope.targets[p] || (scope.targets[p] && checkIfIsOver(scope.targets[p].target))) {
                    scope.funcsDown[p](xPos, yPos);
                }
            }
        }
    }


    function renderUpCallbacks() {
        for (var p in scope.funcsOver) {
            if (scope.funcsOver[p] != null) {
                if (scope.targets[p]) {
                    if (scope.targets[p].isOver) {
                        scope.targets[p].isOver = false;
                        scope.funcsOver[p](false);
                    }
                }
            }
        }
        for (p in scope.funcsUp) {
            if (scope.funcsUp[p] != null) {
                // check if over target
                if (!scope.targets[p] || (scope.targets[p] && checkIfIsOver(scope.targets[p].target))) {
                    scope.funcsUp[p]();
                }

            }
        }
    }
    function checkIfIsOver(target) {
        var result = false;
        var rect;
        if (target.width && target.x) {
            rect = target;
        } else {
            rect = getRectangle(target);
        }

        /*console.log('rect.x ' +  rect.x);
         console.log('rect.y ' +  rect.y);
         console.log('rect.width ' +  rect.width);
         console.log('rect.height ' +  rect.height);*/
        if (scope.x > rect.x && scope.x < rect.x + rect.width && scope.y > rect.y && scope.y < rect.y + rect.height) {
            result = true;
        }
        return result;
    };
    function getRectangle(target) {
        var rect = {};

        rect.width = target.offsetWidth;
        rect.height = target.offsetHeight;

        rect.x = 0;
        rect.y = 0;
        var elem = target;
        do {
            if (!isNaN(elem.offsetLeft)) {
                rect.x += elem.offsetLeft;
            }
            if (!isNaN(elem.offsetTop)) {
                rect.y += elem.offsetTop;
            }
        } while (elem = elem.offsetParent);

        return rect;

    };


    // TOUCH EVENTS
    var funcMove = function(event){
        if (event.targetTouches.length == 1) {
            var touch = event.targetTouches[0];
            scope.x = touch.pageX;
            scope.y = touch.pageY;

            scope.xBody = touch.pageX;
            scope.yBody = touch.pageY;

            renderMoveCallbacks();
        }
    };
    var funcDown = function(event){
        if (event.targetTouches.length == 1) {
            var touch = event.targetTouches[0];
            scope.x = touch.pageX + (window.scrollX ? window.scrollX : document.documentElement.scrollLeft);
            scope.y = touch.pageY + (window.scrollY ? window.scrollY : document.documentElement.scrollTop);

            renderDownCallbacks();
        }
    };
    var funcUp = function(event){
        renderUpCallbacks();
    };
    document.ontouchstart = function(e){
        funcDown(e);
        funcMove(e);
        document.ontouchmove = funcMove;
    };
    document.ontouchend = function(e){
        funcUp(e);
        document.ontouchmove = null;
    };


    // MOUSE EVENTS
    document.onmousemove = function (e) {

        var multiplier = 1;
        var ratioX = e.clientX / window.innerWidth;
        var ratioY = e.clientY / window.innerHeight;

        scope.x = e.clientX + (window.scrollX ? window.scrollX : document.documentElement.scrollLeft);
        scope.y = e.clientY + (window.scrollY ? window.scrollY : document.documentElement.scrollTop);


        scope.xBody = e.clientX;
        scope.yBody = e.clientY;


        renderMoveCallbacks();
    };

    document.onclick = function (e) {

        scope.x = e.clientX + (window.scrollX ? window.scrollX : document.documentElement.scrollLeft);
        scope.y = e.clientY + (window.scrollY ? window.scrollY : document.documentElement.scrollTop);

        for (var p in scope.funcsClick) {
            if (scope.funcsClick[p] != null) {
                // check if over target
                if (!scope.targets[p] || (scope.targets[p] && checkIfIsOver(scope.targets[p].target))) {

                    scope.funcsClick[p].click();
                }
            }
        }

    }

    document.onmousedown = function (e) {
        scope.x = e.clientX + (window.scrollX ? window.scrollX : document.documentElement.scrollLeft);
        scope.y = e.clientY + (window.scrollY ? window.scrollY : document.documentElement.scrollTop);

        renderDownCallbacks();
    };


    document.onmouseup = function (e) {
        scope.x = e.clientX + (window.scrollX ? window.scrollX : document.documentElement.scrollLeft);
        scope.y = e.clientY + (window.scrollY ? window.scrollY : document.documentElement.scrollTop);

        renderUpCallbacks();
    };


    return this;
};
