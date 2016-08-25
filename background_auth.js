//oauth2 auth
chrome.identity.getAuthToken(
	{'interactive': true},
	function(){
	  //load Google's javascript client libraries
		window.gapi_onload = authorize;
		loadScript('https://apis.google.com/js/client.js');
	}
);

function loadScript(url){
  var request = new XMLHttpRequest();

	request.onreadystatechange = function(){
		if(request.readyState !== 4) {
			return;
		}

		if(request.status !== 200){
			return;
		}

    eval(request.responseText);
	};

	request.open('GET', url);
	request.send();
}

function authorize(){
  gapi.auth.authorize(
		{
			client_id: '932286589146-7hkf5kahgqeqjr3q5psj8ob3gmm0l4g0.apps.googleusercontent.com',
			immediate: true,
			scope: 'https://www.googleapis.com/auth/gmail.readonly'
		},
		function(){
		  gapi.client.load('gmail', 'v1', gmailAPILoaded);
		}
	);
}


function gmailAPILoaded(){
  //do stuff here
  console.log('gmail api loaded');
  /*listLabels(function(labels) {
    console.log(labels);  
  });*/
  
}


/* here are some utility functions for making common gmail requests */
function getThreads(query, labels){
  return gapi.client.gmail.users.threads.list({
		userId: 'me',
		q: query, //optional query
		labelIds: labels //optional labels
	}); //returns a promise
}

//takes in an array of threads from the getThreads response
function getThreadDetails(threads){
  var batch = new gapi.client.newBatch();

	for(var ii=0; ii<threads.length; ii++){
		batch.add(gapi.client.gmail.users.threads.get({
			userId: 'me',
			id: threads[ii].id
		}));
	}

	return batch;
}

function getThreadHTML(threadDetails){
  var body = threadDetails.result.messages[0].payload.parts[1].body.data;
	return B64.decode(body);
}

function archiveThread(id){
  var request = gapi.client.request(
		{
			path: '/gmail/v1/users/me/threads/' + id + '/modify',
			method: 'POST',
			body: {
				removeLabelIds: ['INBOX']
			}
		}
	);

	request.execute();
}

var sendMessage = function(msg) {
  chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": msg}, function(response) {
      console.log("response function called in background js");
    });
  });
}

chrome.browserAction.onClicked.addListener(function (tab) {
  sendMessage("hello I was clicked so I sent a message");  
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('message received in background_auth.js');
  if(request.message === "get_labels")
    listLabels(function(labels) {
      console.log("finished getting data from listlabels");
      sendResponse(labels);
          
    });
  
  return true; //Indicates to chrome that we will call sendResponse as async
});

/**
 * Print all Labels in the authorized user's inbox. If no labels
 * are found an appropriate message is printed.
 */
function listLabels(callback) {
  console.log('entered list labels');
  var request = gapi.client.gmail.users.labels.list({
    'userId': 'me'
  });

  request.execute(function(resp) {
    var labels = resp.labels;

    if (labels && labels.length > 0) {
      for (i = 0; i < labels.length; i++) {
        //console.log('label: ' + labels[i].name);
      }
    } else {
      console.log('no labels found');
    }
    
    callback(labels);
  });
}
