require('dotenv').config();
var keys = require('./keys.js');
var axios = require('axios');
var SpotifyAPI = require('node-spotify-api');
var moment = require('moment');
var fs = require('./random.txt');

var input = process.argv[2];
var input2 = process.argv[3];
var searchTerm = process.argv.splice(3).join(" ");



//Spotify Function

var spotifyFxn = function(){
    var clientId = process.env.SPOTIFY_ID;
    var clientSecret = process.env.SPOTIFY_SECRET;
    var spotify = new SpotifyAPI({
        id: clientId,
        secret: clientSecret,
    });
      
    spotify.search({
        type: 'track',
        query: input2,
    }, function(error, data){
        if (!error){
            var info = data.tracks.items;
            for( var i = 0; i < 5; i++){
                if (info[i] != undefined){
                    var results = {
                        'artist': info[i].artists[0].name,
                        'song': info[i].name,
                        'prvURL': info[i].preview_url,
                        'album': info[i].album.name,
                    };
                    
                    console.log('Song Title: ' + results.song);
                    console.log('Album Title: ' + results.album);
                    console.log('Artist: ' + results.artist);
                    console.log('Preview: ' + results.prvURL);

                };
            };
        }
        else{
            console.log(error);
        }
    });
};


//Band is in Town function
function concertThis(){
    axios.get("https://rest.bandsintown.com/artists/" + searchTerm + "/events?app_id=codingbootcamp").then(
        function(response) {
           
             //console.log let user know if there are no results
          if (response.data.length === 0) {
              console.log("That artist has no concerts scheduled");
              return;
          }
          
        //   Date/name/location
            for (var i = 0; i < 5; i++) {
              console.log("Date of Venue: " + moment(response.data[i].datetime).format("MM/DD/YYYY"));
              console.log("Name of Venue: " + response.data[i].venue.name);
              console.log("Location of Venue: " + response.data[i].venue.city + ", "+ response.data[i].venue.country)
            }
        }
    );
}

//OMDB Function
var OMDBFxn = function(){
    var omdb = 'http://www.omdbapi.com/?apikey=trilogy&t=' + input2;

    axios.get(omdb).then(function(response){
        var rsp = response.data;
        console.log('');
        console.log('Title: '+ rsp.Title);
        console.log('Release Date: ' + rsp.Released);
    //   for loop
        for(var i = 0; i < rsp.Ratings.length; i++){
            console.log(rsp.Ratings[i].Source, 'Rating: ', rsp.Ratings[i].Value)
        };

        console.log('Plot Summary: ' + rsp.Plot);
        console.log('Actors: ' + rsp.Actors);
        console.log('Made in: ' + rsp.Country );
        console.log('Language: ' + rsp.Language);
        
        // Using catch statement to handle any errors
    }).catch(function(error){
        console.log(error);
        console.log(error.rsp);
    })
};
var doIt = function(){
    fs.readFile('./random.txt', 'utf8', function(error, data){
        if(error){
        return console.log(error); 
        }
        var dataArr = data.split(',');
        input = dataArr[0];
        input2 = dataArr[1];
        decider();
    });
}
//Interpret Inputs
var decider = function(){
    //BandsInTown
    if(input == 'concert-this'){
        if(!input2){
            input2 = 'Beyonce';
        }
        concertThis();
    }
    //Spotify
    else if(input == 'spotify-this-song'){
        if (!input2){
            input2 = 'Love'
        } 
        spotifyFxn();
    }
    //OMDB
    else if (input == 'movie-this'){
        if (!input2){
            input2 = 'Ever After'
        }   
        OMDBFxn();
    }

    //Wildcard fxn
    else if (input == 'do-what-it-says'){
        doIt();
    }
    else if(!input2 && !input){
        var inst = [
            {
                resource: 'Band is in Town',
                key: '\'concert-this\'',
                noun: 'shows',
            },{
                resource: 'Spotify',
                key: '\'spotify-this-song\'',
                noun: 'songs'
            },{
                resource: 'OMDB',
                key: '\'movie-this\'',
                noun: 'movie'
            }
        ];
        console.log(' ')
        console.log('What would you like to do?');
        console.log('Combine a command and a search keyword for more information on a song, band, or movie!')
        console.log('-------------------');
        for ( var i = 0; i < inst.length; i++){
            console.log(' ')
            console.log(inst[i].key + ' will search ' + inst[i].resource + ' for information on the' + inst[i].noun + ' matching your query.');
        }
        console.log(' ');
        console.log('Just typing \'do-what-it-says\' will use pre-set search keywords.');
        console.log(' ');
        console.log('example: \nnode liri.js \'spotify-this-song\' \'I want it that way\'');
    }
};
//Start the process
decider();

