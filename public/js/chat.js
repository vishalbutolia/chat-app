const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('#message')
const $messageFormButton = $messageForm.querySelector('button')
const $locationSendButton = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')
// const $locationMessage = document.querySelector('#location-message')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// Displaying message
socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

// Displaying location
socket.on('locationMessage', (location) => {
  const html = Mustache.render(locationMessageTemplate, {
    url: location.url,
    createdAt: moment(location.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

// Sending message
$messageForm.addEventListener('submit', (e)=> {
  e.preventDefault()
  
  // disable submit button 
  $messageFormButton.setAttribute('disabled', 'disabled')

  const message = $messageFormInput.value
  socket.emit('sendMessage', message, (error) => {
    // enable submit button
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    
    if(error){
      return console.log(error);
    }
    console.log('Message delivered!')
  })
})

// Sending location
$locationSendButton.addEventListener('click', (e)=> {
  e.preventDefault()

  // disable button
  $locationSendButton.setAttribute('disabled', 'disabled')

  if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser')
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const coords = {
      latitude: position.coords.latitude, 
      longitude: position.coords.longitude
    }
    socket.emit('sendLocation', coords, () => {
      $locationSendButton.removeAttribute('disabled')
      console.log('Location shared!')
    })
  })
})

socket.emit('join', {username, room})