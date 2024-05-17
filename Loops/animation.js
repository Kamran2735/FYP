anime({
    targets: '#svg path',
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: 'easeInOutSine',
    duration: 1500,
    direction: 'alternate',
    loop: false
  });
// Define paths
var startPath = anime.path('#startPath');
var loopPath = anime.path('#loopPath');
var endPath = anime.path('#endPath');

// Define animations
var startAnimation = anime({
targets: '#animatedObject',
translateX: startPath('x'),
translateY: startPath('y'),
easing: 'linear',
duration: 1000,
autoplay: false,
complete: function() {
  setTimeout(function() {
    loopAnimation.restart();
  }, 1000); // Delay 1 second
}
});

var loopAnimation = anime({
targets: '#animatedObject',
translateX: loopPath('x'),
translateY: loopPath('y'),
rotate: loopPath('angle'),
easing: 'linear',
duration: 2000,
loop: 4,
autoplay: false,
complete: function() {
  setTimeout(function() {
    endAnimation.restart();
  }, 1000); // Delay 1 second
}
});

var endAnimation = anime({
targets: '#animatedObject',
translateX: endPath('x'),
translateY: endPath('y'),
easing: 'linear',
duration: 1000,
autoplay: false,
complete: function() {
  setTimeout(function() {
    restartStartAnimation();
  }, 1000); // Delay 1 second
}
});

// Start the animation sequence
function restartStartAnimation() {
setTimeout(function() {
startAnimation.restart();
}, 1600); // Delay 1 second before restarting
}
restartStartAnimation();