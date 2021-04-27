'use strict';

const messagesList = document.querySelector('#messages');
const publishForm = document.querySelector('#publish');
// We send a message from the input
publishForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let message = this.elements.message.value.trim();
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/publish", true); 
    // A POST request with the data to our server
    xhr.send(JSON.stringify({message: message}));
    
    xhr.onload = function() {
        if (xhr.status == 413) {
            alert(xhr.responseText);
        }
    };
    
    this.elements.message.value = '';
    console.log(message);
    return false;
});


// Long-pooling caht
subscribe();
function subscribe() {

    const xhr = new XMLHttpRequest();

    xhr.open("GET", "/subscribe", true);

    // When a response was got, it is output as a text message
    xhr.onload = function() { 
        console.warn(this);
        let li = document.createElement('li');
        li.textContent = this.responseText;
        messagesList.append(li);

        // A new request again
        subscribe();
    };
    // There is a repeat of a request after the delay
    xhr.onerror = xhr.onabort = () => {
        setTimeout(subscribe, 500);
    };
    
    xhr.send();
}
