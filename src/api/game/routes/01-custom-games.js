
module.exports = {
    routes: [
      { // Path defined with an URL parameter
        method: 'POST',
        path: '/games/populate', 
        handler: 'game.populate',
      },
    ]
  }