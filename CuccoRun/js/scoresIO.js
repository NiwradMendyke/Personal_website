// Initialize Firebase
var config = {
   apiKey: "AIzaSyCdvVtlL4eV6uvaUwJMW8hQU5jWsz8Ir60",
   authDomain: "cuccorun.firebaseapp.com",
   databaseURL: "https://cuccorun.firebaseio.com",
   storageBucket: "cuccorun.appspot.com",
   messagingSenderId: "556729195586"
};
firebase.initializeApp(config);

var database = firebase.database();

var sortedScores = [];

function readData() {
   if (sortedScores.length > 0) {
      sortedScores = [];
   }

   console.log("readData() called")
   database.ref('scores').once('value').then(function(snapshot) {
      snapshot.forEach(function(item) {
         username = item.val().username
         score = item.val().score
         sortedScores.push({key:username, val:score})
      })

      sortedScores = sortedScores.sort(function (a, b) {
          return a.val < b.val;
      });

      for (i = 0; i < sortedScores.length; i++) {
         //console.log(sortedScores[i])
         $('#tablebody').append("<tr><th><b>" + sortedScores[i].key + "</b></th><th><b>" + sortedScores[i].val + "</b></th></tr>")
      }
   })
}

function writeData(username, score) {
   console.log("writeData() called")
   firebase.database().ref('scores').push({
      username: username,
      score: score
   }, function(error) {
      if (error) {
         console.log('Error has occured during saving process')
      }
     else {
        console.log("Data hss been saved succesfully")
     }
   })
}
