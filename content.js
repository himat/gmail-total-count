
function updateEmailCounts() {
  var labels = document.querySelectorAll("span.nU");
  for(var i=0; i<labels.length; i++) {
    var link = labels[i].firstChild;
    link.innerHTML = link.title + " (#)";
    console.log(link.title);
  }
    
      
    
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("args received in content.js : " + request.args);
  updateEmailCounts();
});