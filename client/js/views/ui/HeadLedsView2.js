APP.HeadLedsView2 = function(container){
    var w;
    var h;

    var wLed = 8;
    var hLed = 8;
    var wSep = 4;
    var hSep = 6;

    var nbLine;
    var nbCol;

    var canvasContainer = document.createElement('canvas');
    canvasContainer.className = "trameCanvas";
    container.append(canvasContainer);
    var ctx = canvasContainer.getContext('2d');

    function init(){
        w = $(window).width();
        h = $(window).height();

        nbLine = Math.ceil(h / (hLed+hSep));
        nbCol =  Math.ceil(w / (wLed+wSep));

        console.log(nbLine);
        console.log(nbCol);

        canvasContainer.width = w;
        canvasContainer.height = h;

        ctx.clearRect(0, 0, canvasContainer.width, canvasContainer.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        for (var i = 0; i < nbLine; i++) {
            ctx.fillRect(0, (i*(hSep+hLed)), w, hSep);
        }
        for (i = 0; i < nbCol; i++) {
            ctx.fillRect((i*(wSep+wLed)), 0, wSep, h);
        }
    }

    $(window).on('resize', function(){
        init();
    });

    init();

    return this;
};