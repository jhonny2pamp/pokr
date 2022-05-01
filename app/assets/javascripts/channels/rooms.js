// $(document).on("turbolinks:load", function() {
//   var $currentUser = parseInt($('body').attr('data-current-user'));
//
//   if ($currentUser > 0) {
//     App.screens = App.cable.subscriptions.create({ channel: 'RoomsChannel', room: $currentUser }, {
//       connected: function() {},
//       disconnected: function() {},
//       received: function(data) {
//         console.log(data);
//       }
//     });
//   }
// });
