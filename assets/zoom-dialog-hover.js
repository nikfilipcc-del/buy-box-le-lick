window.addEventListener('DOMContentLoaded', function() {
  // Check if there are any .demo-trigger elements and .zoom-detail exists
  var demoTriggers = document.querySelectorAll('.demo-trigger');
  var paneContainer = document.querySelector('.zoom-detail');  // Assuming the paneContainer is the same for all
  
  if (demoTriggers.length === 0) {
    console.error('No demo-trigger elements found!');
    return;  // No .demo-trigger elements to apply Drift
  }

  if (!paneContainer) {
    console.error('No .zoom-detail container found!');
    return;  // No paneContainer to show the zoomed image
  }

  console.log("demoTriggers====>", demoTriggers);

  // Loop through all .demo-trigger elements and initialize Drift
  demoTriggers.forEach(function(demoTrigger) {
    new Drift(demoTrigger, {
      paneContainer: paneContainer,
      inlinePane: true,
      zoomFactor: 3,
    });
  });
});