"use strict";
var EFMViewer = (function() {
	//
	// Variables
  //

  var player = {};
  var TLcontrols = {};
  var playButton = document.querySelector('.efm__play-pause');
  var playButtonIcon = document.querySelector( '.efm__play-pause .mdi' );
  var seekBar = document.querySelector('.efm__seek-bar');
  var seekTime = document.querySelector('.efm__seek-time');
  var media = document.querySelector('.efm__media');
  var mediaCollection = document.querySelector('.efm__media-collection');
  var controls = document.querySelector('.efm__controls');
  var nextButton = document.querySelector('.efm__next');
  var backButton = document.querySelector('.efm__previous');
  var timerCurrent = document.querySelector('.efm__timer-current');
  var timerTotal = document.querySelector('.efm__timer-total');
  var playSpeed = document.querySelector('.efm__play-speed');
  var mediaStartTime = 64.2e5;
  var mediaEndTime = 54.9e6;
  var mediaDurationOffset = 80e3;
  var mediaTotalTime = mediaEndTime - mediaStartTime;
  var mediaPixelOffset = 72;
  var scrollPercent;

  // Element to animate
  var marquee = document.querySelector('.efm__media-collection');
  marquee.style.whiteSpace = 'nowrap';
  // Children of element to animate (i.e. images)
  var children = [].slice.call(marquee.querySelectorAll( '.efm__media-item img'));
  var displacement = 0;

  player.init = function() {
    this.rate = 1;
    imagesLoaded( children, _createMarquee );
  };

  // Private methods
  var _createMarquee = function() {
    // Add up the width of all the elements in the marquee
    displacement = children.map(function(child) {
      //console.log("X1: ", child.clientWidth);
      return child.clientWidth;
    }).reduce(function(acc, next) {
      return acc + next;
    }) - marquee.clientWidth << 0;
    /*
    Crucial: subtract the width of the container;
    Optional: take the opportunity to round the displacement 
    value down to the nearest pixel. The browser may thank
    you for this by not blurring your text.
    */
    /*for ( var j = 0; j < children.length; ++j ) {
      displacement += children[j].clientWidth;
      console.log(displacement);
      displacement = (displacement - marquee.clientWidth) << 0;
    }*/
    console.log("Children #: ", children.length);
    console.log("Children width: ", displacement);
    console.log("marquee.clientWidth: ", marquee.clientWidth);
    timerCurrent.textContent = secondsToHms( mediaStartTime / 1000 ) || 0;
    _animateMarquee();
    //_addEvents();
  };

  var _animateMarquee = function() {
    player.duration = ( children.length * (4 * 673342) ) / player.rate;
    _addEvents();
    TLcontrols = anime.timeline({
      //direction: 'alternate',
      loop: false,
      easing: 'linear',
      //easing: 'easeOutQuad',
      run: function(animation) {
        //animation.progress === 100 && player.speed !== void 0 && (anime.speed = player.speed, player.speed = void 0);
      },
      complete: function(animation) {
        //runLogEl.value = 'not running';
        //runProgressLogEl.value = 'progress : 100%';
      },
      update: function(animation) {
        //console.log(animation);
        seekBar.value = TLcontrols.progress;
        seekBar.setAttribute('aria-valuenow', seekBar.value);

        //seekTime.textContent = secondsToHms( Math.round(animation.currentTime / 1000) || 0);
        //timerCurrent.textContent = (Math.round(animation.progress) ) || 0;
        if (seekTime && seekTime.textContent) {
          seekTime.textContent = seekBar.value;
        }
        //timerCurrent.textContent = ( Math.round(animation.currentTime) ) || 0;
        timerCurrent.textContent = secondsToHms( (animation.currentTime / 1000 ) + ( mediaStartTime / 1000) ) || 0;
        //timerTotal.textContent = secondsToHms(animation.duration / 100);
      },
      autoplay: false
    });

    TLcontrols
    .add({
      targets: marquee,
      translateX: [
        { value: -displacement }
      ],
      duration: function() { return player.duration },
      loop: true,
      offset: 0
    })

    console.log("TLcontrols: ", TLcontrols);
    console.log("Player duration: ", player.duration );
    playButton.addEventListener('click', _playMarquee, false );
  }

  var _playMarquee = function(evt) {
    evt.preventDefault();
    //seekBar.value = TLcontrols.progress;
    TLcontrols.seek(TLcontrols.duration * (seekBar.value / 100));
    if ( TLcontrols.paused ) {
      TLcontrols.play();
      playButtonIcon.classList.remove('mdi-play');
      playButtonIcon.classList.add('mdi-pause');
      showLog();
    }
    else {
      TLcontrols.pause();
      playButtonIcon.classList.remove('mdi-pause');
      playButtonIcon.classList.add('mdi-play');
      showLog();
    }
  }

  var _addEvents = function() {
    seekBar.addEventListener('input', function() {
      TLcontrols.seek(TLcontrols.duration * (seekBar.value / 100));
    });
    
    ['input','change'].forEach(function(evt) {
      seekBar.addEventListener(evt, function() {
        TLcontrols.pause();
        playButtonIcon.classList.remove('mdi-pause');
        playButtonIcon.classList.add('mdi-play');
        TLcontrols.seek(TLcontrols.duration * (seekBar.value / 100));
      });
    });

    // https://github.com/juliangarnier/anime/issues/48
    playSpeed.addEventListener('change', function() {
      console.log("TLcontrols.duration before: ", TLcontrols.duration);
      TLcontrols.pause();
      var rate = playSpeed.options[playSpeed.selectedIndex];
      player.rate = +(rate.value) || 1;
      player.duration = TLcontrols.duration;
      player.currentTime = TLcontrols.currentTime;
      player.progress = TLcontrols.progress;
      player.adjustment = Math.floor((100 / player.duration) * player.currentTime);
      if ( !TLcontrols.paused ) {
        playButtonIcon.classList.add('mdi-pause');
        playButtonIcon.classList.remove('mdi-play');
      }
      else {
        playButtonIcon.classList.remove('mdi-pause');
        playButtonIcon.classList.add('mdi-play');
      }
      anime.remove('.efm__media-collection');
      _animateMarquee();
      showLog();
     });

     //media.addEventListener('scroll', debounce(setScroll), { passive: true });
     media.addEventListener('scroll', debounce(setScroll), { passive: true });

     nextButton.addEventListener('click', _skipForward, false );
     backButton.addEventListener('click', _skipBackward, false );
  }

  var setScroll = function() {
    if ( TLcontrols.currentTime === 0 ) {
      TLcontrols.play();
    }
    TLcontrols.pause();
    playButtonIcon.classList.remove('mdi-pause');
    playButtonIcon.classList.add('mdi-play');
    var xPos = 0;
    if (media) {
      //xPos += (media.offsetLeft - media.scrollLeft + media.clientLeft);
      xPos += (media.offsetLeft - media.scrollLeft + media.clientLeft);
    }
    //player.progress = (Math.abs(xPos) / displacement) * 100;
    //player.progress = Math.floor((100 / displacement) * xPos);
    scrollPercent = (xPos / displacement) * 100;
    console.log("\nscrollPercent: " + scrollPercent);
    mediaCollection.dataset.scroll = xPos;
    console.log("x: ", xPos, " media.offsetLeft: ", media.offsetLeft, " media.scrollLeft: ", media.scrollLeft, " media.clientLeft: ", media.clientLeft, "scrollPercent: ", scrollPercent);
    TLcontrols.progress = Math.abs(scrollPercent);
    TLcontrols.currentTime = scrollPercent * TLcontrols.duration;
    _updateSeekbar();
    showLog();
  }

  // Update the progress bar
  var _updateSeekbar = function() {
    seekBar.value = TLcontrols.progress;
    //TLcontrols.seek(TLcontrols.duration * (seekBar.value / 100));
    TLcontrols.seek((seekBar.value / 100) * TLcontrols.duration);
    console.log("TL progress: " + TLcontrols.progress);
    // Work out how much of the media has played via the duration and currentTime parameters
    //var percentage = Math.floor((100 / player.duration) * player.currentTime);
    // Update the progress bar's value
    //progressBar.value = percentage;
    // Update the progress bar's text (for browsers that don't support the progress element)
    //progressBar.innerHTML = percentage + '% played';
  }

  var _skipForward = function(evt) {
    evt.preventDefault();
    if ( TLcontrols.currentTime === 0 ) {
      TLcontrols.play();
    }
    TLcontrols.pause();
    playButtonIcon.classList.remove('mdi-pause');
    playButtonIcon.classList.add('mdi-play');
    console.log("Skip Next");
    TLcontrols.seek( (TLcontrols.duration * (seekBar.value / 100)) + ( TLcontrols.duration / (children.length * (children.length / 3) )) );
    _updateSeekbar();
  }

  var _skipBackward = function(evt) {
    evt.preventDefault();
    if ( TLcontrols.currentTime === 0 ) {
      TLcontrols.play();
    }
    TLcontrols.pause();
    playButtonIcon.classList.remove('mdi-pause');
    playButtonIcon.classList.add('mdi-play');
    console.log("Skip Back");
    TLcontrols.seek( (TLcontrols.duration * (seekBar.value / 100)) - ( TLcontrols.duration / (children.length * (children.length / 3) )) );
    _updateSeekbar();
  }

  var _seek = function(e) {
    var percent = e.offsetX / this.offsetWidth;
    player.currentTime = percent * player.duration;
    e.target.value = Math.floor(percent / 100);
    e.target.innerHTML = progressBar.value + '% played';
  }

  // The debounce function receives our function as a parameter
  const debounce = (fn) => {
    // This holds the requestAnimationFrame reference, so we can cancel it if we wish
    let frame;

    // The debounce function returns a new function that can receive a variable number of arguments
    return (...params) => {
      
      // If the frame variable has been defined, clear it now, and queue for next frame
      if (frame) { 
        cancelAnimationFrame(frame);
      }

      // Queue our function call for the next frame
      frame = requestAnimationFrame(() => {
        // Call our function and pass any params we received
        fn(...params);
      });
    } 
  };

  /**
   * Utilities
   */
  function secondsToHms(date) {
    date = Number(date);
    var h = Math.floor(date / 3600);
    var m = Math.floor(date % 3600 / 60);
    var s = Math.floor(date % 3600 % 60);
    return (h > 0 ? h + ':' : '') + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function listener(event) {
    console.log(event.type, event.pageX, event.pageY);
  }

  function showLog() {
    console.log("\nseekBar.value: ", seekBar.value , '%', "\n TLcontrols.progress: ", TLcontrols.progress, "\n TLcontrols.duration: ", TLcontrols.duration, "\n TLcontrols.currentTime: ", TLcontrols.currentTime);
  }

  if (document.readyState != 'loading') {
    player.init();
    console.log('Hello EFM1!');
  }
	// modern browsers
	else if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function() { player.init(); }, false);
    console.log('Hello EFM2!');
  }

})();




