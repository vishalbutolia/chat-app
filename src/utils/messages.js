const generateMessage = (username, text) => {
  return {
    text,
    username,
    'createdAt': new Date().getTime() 
  }
}

const generateLocationMessage = (username, coords) => {
  return {
    url: `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
    username,
    'createdAt': new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}