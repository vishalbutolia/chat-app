const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('#message')
const $messageFormButton = $messageForm.querySelector('button')
const $locationSendButton = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild

  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  const visibleHeight = $messages.offsetHeight
  const containerHeight = $messages.scrollHeight
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

// Displaying message
socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    username: message.username,
    createdAt: moment(message.createdAt).format('h:mm a')
  })

  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

// Displaying location
socket.on('locationMessage', (location) => {
  const html = Mustache.render(locationMessageTemplate, {
    url: location.url,
    username: location.username,
    createdAt: moment(location.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
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
      alert(error)
      location.href = '/'
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

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', {username, room}, (error) => {
  if(error){
    alert(error)
    location.href = '/'
  }
})