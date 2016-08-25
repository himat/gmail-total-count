function save_options() {
  console.log("saving options");
  var labels = document.forms['labels_form'].elements['gmail_labels[]'];
  var labelsChecked = [];
  for(var i=0; i<labels.length; i++) {
    console.log(labels[i]);
    labelsChecked.push(labels[i].checked);
  }
  
  
  
  chrome.storage.sync.set({
    labelsChecked: labelsChecked
  }, function() {
    // Update status to let user know the options were saved
    var status = document.getElementById('status');
    status.textContent = 'Options saved!';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  
  });
}

function restore_options() {
  populate_labels();
  console.log("restoring options");
  chrome.storage.sync.get({
    labelsChecked: []
  }, function(saved) {
    var labels = document.forms['labels_form'].elements['gmail_labels[]'];
    console.log(saved.labelsChecked);
    // Default value of false
    while(saved.labelsChecked.length < labels.length)
      saved.labelsChecked.push(false);
      
    for(var i=0; i<labels.length; i++) {
      console.log(saved.labelsChecked[i]);
      labels[i].checked = saved.labelsChecked[i];
    }
    
  });
}

function populate_labels() {
  chrome.runtime.sendMessage({"message": "get_labels"}, function(labels) {
    console.log("response function called in options.js");
    var container = document.getElementById("labels_area");
    for(var i=0; i<labels.length; i++) {
      var currLabel = labels[i].name;
      
      var textLabel = document.createElement("label");
      var desc = document.createTextNode(currLabel);
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "gmail_labels[]";
      checkbox.value = currLabel;
      
      textLabel.appendChild(checkbox);
      textLabel.appendChild(desc);
      
      container.appendChild(textLabel);
      container.appendChild(document.createElement("br"));
      
    }
  });
}

console.log("in options js");
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('btn_save').addEventListener('click', save_options);