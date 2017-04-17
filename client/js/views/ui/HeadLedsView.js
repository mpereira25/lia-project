APP.HeadLedsView = function(container){


    var w = $(window).width();
    var h = $(window).height();


    var wLedPanel = 600;

    var wLedWithSep = Math.ceil(w / wLedPanel);
    var wLed = Math.ceil(wLedWithSep*2/3);
    var hLed = wLed;
    var wSep = Math.ceil(wLedWithSep/3);
    var hSep = wLed;

    var nbCol = Math.ceil(wLedPanel);
    var nbLine = Math.ceil(h / (hLed+hSep));

    console.log(w);
    console.log(wLed);
    console.log(nbCol);
    console.log(nbLine);

    var tabLeds = [];

    var canvasContainer = document.createElement('canvas');
    canvasContainer.width = w;
    canvasContainer.height = h;
    container.append(canvasContainer);
    var ctx = canvasContainer.getContext('2d');

    var pixelsDatas = [];
    var nb = 1;
    var current = 1;
    var img = new Image();

    function init(){

        img.onload = function(){ // always fires the event.
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

            var pixelData;
            var datas = [];
            var line;
            for (i = 0; i < canvas.height; i++) {
                line = [];
                for (j = 0; j < canvas.width; j++) {
                    pixelData = canvas.getContext('2d').getImageData(j, i, 1, 1).data;
                    if(pixelData[3] > 0){
                        line.push(pixelData);
                    }else{
                        line.push(null);
                    }

                }
                datas.push(line);
            }
            pixelsDatas.push(datas);
            current++;
            loadNextImage();
        };
        // handle failure
        img.onerror = function(){

        };

        loadNextImage();
    }

    function loadNextImage(){
        if(current <= nb){
            img.src = "assets/eye.png";
        }else{
            current = 0;
            displayNext();
        }

    }
    function displayNext(){
        if(current >= nb){
            current = 0;
        }
        displayIndex(current);
        current++;
        setTimeout(displayNext, 50);
    }
    function displayIndex(index){

        var degrade = 1;
        ctx.clearRect(0, 0, canvasContainer.width, canvasContainer.height);
        for (var i = 0; i < nbLine; i++) {
            for (var j = 0; j < nbCol; j++) {
                if(pixelsDatas[index][i] && pixelsDatas[index][i][j]){
                    ctx.fillStyle = "rgba(" + pixelsDatas[index][i][j][0] + "," + pixelsDatas[index][i][j][1] + "," + pixelsDatas[index][i][j][2] + ", 1)";
                    ctx.fillRect((j*wSep + j*wLed), (i*hSep + i*hLed), wLed, hLed);

                    ctx.fillStyle = "rgba(" + pixelsDatas[index][i][j][0] + "," + pixelsDatas[index][i][j][1] + "," + pixelsDatas[index][i][j][2] + ", 0.5)";
                    ctx.fillRect(((j-degrade)*wSep + (j-degrade)*wLed), (i*hSep + i*hLed), wLed, hLed);
                    ctx.fillRect(((j+degrade)*wSep + (j+degrade)*wLed), (i*hSep + i*hLed), wLed, hLed);
                    ctx.fillRect((j*wSep + j*wLed), ((i-degrade)*hSep + (i-degrade)*hLed), wLed, hLed);
                    ctx.fillRect((j*wSep + j*wLed), ((i+degrade)*hSep + (i+degrade)*hLed), wLed, hLed);


                    //tabLeds[i][j].enable();
                }else{
                    //tabLeds[i][j].disable();
                }
            }
        }
    }

    function fillDegrade(i, j){

        fill(i, j, 1, 0.5);
        fill(i, j, 2, 0.2);

        function fill(i, j, index, alpha){
            ctx.fillStyle = "rgba(" + pixelsDatas[index][i][j][0] + "," + pixelsDatas[index][i][j][1] + "," + pixelsDatas[index][i][j][2] + "," + alpha +")";
            if(j >= index){
                ctx.fillRect(((j-index)*wSep + (j-index)*wLed), (i*hSep + i*hLed), wLed, hLed);
            }
            if(j < nbCol-index){
                ctx.fillRect(((j+index)*wSep + (j+index)*wLed), (i*hSep + i*hLed), wLed, hLed);
            }
            if(i >= index){
                ctx.fillRect((j*wSep + j*wLed), ((i-index)*hSep + (i-index)*hLed), wLed, hLed);
            }
            if(i < nbLine - index){
                ctx.fillRect((j*wSep + j*wLed), ((i+index)*hSep + (i+index)*hLed), wLed, hLed);
            }

        }

    }


    init();


    return this;
};