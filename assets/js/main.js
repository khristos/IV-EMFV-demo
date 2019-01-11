"use strict";var EFMViewer=function(){var player={};var TLcontrols={};var playButton=document.querySelector(".efm__play-pause");var playButtonIcon=document.querySelector(".efm__play-pause .mdi");var seekBar=document.querySelector(".efm__seek-bar");var seekTime=document.querySelector(".efm__seek-time");var media=document.querySelector("efm__media");var controls=document.querySelector(".efm__controls");var timerCurrent=document.querySelector(".efm__timer-current");var timerTotal=document.querySelector(".efm__timer-total");var playSpeed=document.querySelector(".efm__play-speed");var mediaStartTime=107e3;var mediaEndTime=549e5;var mediaTotalTime=mediaEndTime-mediaStartTime;var marquee=document.querySelector(".efm__media-collection");marquee.style.whiteSpace="nowrap";var children=[].slice.call(marquee.querySelectorAll(".efm__media-item img"));var displacement=0;player.init=function(){this.rate=1;imagesLoaded(children,_createMarquee)};var _createMarquee=function _createMarquee(){displacement=children.map(function(child){return child.clientWidth}).reduce(function(acc,next){return acc+next})-marquee.clientWidth<<0;console.log("Children#: ",children.length);console.log("X1: ",displacement);displacement=displacement<<0;_animateMarquee();_addEvents()};var _animateMarquee=function _animateMarquee(){TLcontrols=anime.timeline({loop:false,easing:"linear",run:function run(animation){},complete:function complete(animation){},update:function update(animation){seekBar.value=animation.progress||0;seekTime.textContent=seekBar.value;timerCurrent.textContent=Math.round(animation.currentTime)||0},autoplay:false});TLcontrols.add({targets:marquee,translateX:[{value:-displacement}],duration:function duration(){return children.length*2e5/player.rate},offset:0});console.log("TLcontrols: ",TLcontrols);console.log("duration: ",children.length*2e5/player.rate);playButton.addEventListener("click",_playMarquee,false)};var _playMarquee=function _playMarquee(evt){evt.preventDefault();if(TLcontrols.paused){TLcontrols.play();playButtonIcon.classList.remove("mdi-play");playButtonIcon.classList.add("mdi-pause");console.log("seekBar.value: ",seekBar.value,"\n animation.progress: ",TLcontrols.progress,"\n TLcontrols.duration after: ",TLcontrols.duration,"\n TLcontrols.currentTime: ",TLcontrols.currentTime)}else{TLcontrols.pause();playButtonIcon.classList.remove("mdi-pause");playButtonIcon.classList.add("mdi-play")}};var _addEvents=function _addEvents(){seekBar.addEventListener("input",function(){TLcontrols.seek(TLcontrols.duration*(seekBar.value/100))});["input","change"].forEach(function(evt){seekBar.addEventListener(evt,function(){TLcontrols.pause();playButtonIcon.classList.remove("mdi-pause");playButtonIcon.classList.add("mdi-play");TLcontrols.seek(TLcontrols.duration*(seekBar.value/100))})});playSpeed.addEventListener("change",function(){console.log("TLcontrols.duration before: ",TLcontrols.duration);TLcontrols.pause();if(!TLcontrols.paused){playButtonIcon.classList.add("mdi-pause");playButtonIcon.classList.remove("mdi-play")}else{playButtonIcon.classList.remove("mdi-pause");playButtonIcon.classList.add("mdi-play")}var rate=playSpeed.options[playSpeed.selectedIndex];player.rate=+rate.value||1;player.duration=TLcontrols.duration;player.currentTime=TLcontrols.currentTime;player.progress=TLcontrols.progress;player.adjustment=Math.floor(100/player.duration*player.currentTime);anime.remove(".efm__media-collection");_animateMarquee();TLcontrols.seek(TLcontrols.duration*(seekBar.value/100));console.log("seekBar.value: ",seekBar.value,"animation.progress: ",TLcontrols.progress,"TLcontrols.duration after: ",TLcontrols.duration,"TLcontrols.currentTime: ",TLcontrols.currentTime)})};var _updateProgressBar=function _updateProgressBar(){TLcontrols.seek(TLcontrols.duration*(seekBar.value/100))};var seek=function seek(e){var percent=e.offsetX/this.offsetWidth;player.currentTime=percent*player.duration;e.target.value=Math.floor(percent/100);e.target.innerHTML=progressBar.value+"% played"};function secondsToHms(date){date=Number(date);var h=Math.floor(date/3600);var m=Math.floor(date%3600/60);var s=Math.floor(date%3600%60);return(h>0?h+":":"")+(m<10?"0":"")+m+":"+(s<10?"0":"")+s}if(document.readyState!="loading"){player.init();console.log("Hello EFM1!")}else if(document.addEventListener){document.addEventListener("DOMContentLoaded",function(){player.init()},false);console.log("Hello EFM2!")}}();
