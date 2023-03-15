
module.exports = {
  routes: [
    { // Path defined with an URL parameter
      method: 'POST',
      path: '/games/populate',
      handler: 'game.populate',
    },
    { // Path defined with an URL parameter
      method: 'POST',
      path: '/games/populateGames',
      handler: 'game.populateGames',
    },
  ]
}