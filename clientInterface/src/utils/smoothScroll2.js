/**
 * Author : Michel Pereira
 */
var SCROLL_INERTIE = function(){

    var incrementValue = 100;
    var inertie = 4;
    var scrollValueTo = 0;
    var scrollValue = 0;
    var animationId;
    var isFromWheel = false;
    var isFromJS = false;

    var init = function() {

    var flag = true;
    //console.log(navigator.userAgent);

    if(navigator.userAgent.indexOf('MSIE') != -1){

        var version = parseInt(navigator.userAgent.substr(navigator.userAgent.indexOf('MSIE')+4, 4));
        flag = version > 10;
    }

    if(flag){
        var mousewheelevt = (/Gecko/i.test(navigator.userAgent)) || (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x

        //console.log("mousewheelevt " + mousewheelevt );

        if (document.attachEvent){//if IE (and Opera depending on user setting)
            document.attachEvent("on" + mousewheelevt, onmousewheel);
            document.attachEvent("onwheel", onmousewheel);
            document.attachEvent("onscroll", onScroll);
        }
        else if (document.addEventListener){//WC3 browsers
            document.addEventListener(mousewheelevt, onmousewheel, false);
            document.addEventListener('wheel', onmousewheel, false);
            document.addEventListener("scroll", onScroll);
        }

    }


  };

    var onScroll = function() {

    if(!isFromWheel){
        var value = document.body.scrollTop || document.documentElement.scrollTop;
        scrollValue = value;
        scrollValueTo = value;
    }

    };

    var onmousewheel = function(e) {

        window.cancelAnimationFrame(animationId);

        var delta = 0;
        if (!e) e = window.event;
        if (e.wheelDelta) {
            delta = e.wheelDelta/120;
            if ( window.opera ) {  // Opera has the values reversed
                delta= -delta;
            }
        } else if (e.detail) {
            delta = -e.detail/3;
        }

        //console.log("delta " + delta);
        //console.log("e.detail " + e.detail);
        //console.log("e.wheelDelta " + e.wheelDelta);

        if(delta > 0 || delta < 0){

        }else{
            return;
        }

        if (e && e.preventDefault) {
            e.preventDefault();
        }

        scrollValueTo += (delta > 0 ? -incrementValue : incrementValue);

        var body = document.body,
            html = document.documentElement;

        var heightDocument = Math.max( body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight );



        if (scrollValueTo < 0) scrollValueTo = 0;
        if (scrollValueTo > (heightDocument - html.clientHeight)) scrollValueTo = (heightDocument - html.clientHeight);

        scroll();
    };

    var scroll = function() {

        scrollValue += (scrollValueTo - scrollValue) / inertie;

        isFromWheel = true;
        window.scrollTo(0, scrollValue);


        if (Math.abs(scrollValueTo - scrollValue) < 2) {
            scrollValue = scrollValueTo;
            isFromWheel = false;
            isFromJS = false;
            window.cancelAnimationFrame(animationId);
        } else {
            animationId = window.requestAnimationFrame(scroll);
        }
    };

    init();

    return this;


};



(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
      || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());

export default SCROLL_INERTIE();
