import fetch from 'fetch-jsonp'
import moment from 'moment'
import { uniq, sortBy, flattenDeep } from 'lodash'

export function getPopularMovies () {
  return dispatch => {
    const fourStarUrl = 'https://itunes.apple.com/search?country=us&media=movie&entity=movie&limit=100&attribute=ratingIndex&term=4'
    const fiveStarUrl = 'https://itunes.apple.com/search?country=us&media=movie&entity=movie&limit=100&attribute=ratingIndex&term=5'
    const req1 = fetch(fourStarUrl)
    const req2 = fetch(fiveStarUrl)

    return Promise.all([req1, req2])
      .then(responses => responses.map(res => res.json()))
      .then(jsonPromises => Promise.all(jsonPromises))
      .then(jsonResponses => {
        //
        // jsonResponses contains the results of two API requests
        //

        //
        // 1. combine the results of these requests
        // 2. sort the results FIRST by year THEN by title (trackName)
        // 3. each movie object in the results needs a releaseYear attribute added
        //    this is used in src/components/movies-list.js line 26
        //

        // combine both array lists
        const fullList = [...jsonResponses[0].results, ...jsonResponses[1].results];

        // extract relevant fields from movie objects, and move 'The' to end of title 
        // if it appears
        let combinedResults = fullList.map(movie => {

          let splitTrackName = movie.trackName.split(' ');
          if (splitTrackName[0] === 'The') {
            let lastWord = splitTrackName[splitTrackName.length - 1];
            splitTrackName.shift();
            splitTrackName[splitTrackName.length - 1] = `${lastWord}, The`;
            movie.trackName = splitTrackName.join(' ');
          }

          return {
            artworkUrl100: movie.artworkUrl100,
            releaseYear: movie.releaseDate.split('-')[0],
            trackHdPrice: movie.trackHdPrice,
            longDescription: movie.longDescription,
            trackName: movie.trackName,
          }
        });

        // create descending array of unique movie years
        const years = uniq(combinedResults.map(movie => movie.releaseYear));
        years.sort().reverse();
        
        // create object where keys are each movie year, with arrays to hold movies
        // of that year
        const yearBuckets = {};
        years.forEach(year => {
          yearBuckets[year] = [];
        });

        // add movie to proper year
        combinedResults.forEach(movie => {
          yearBuckets[movie.releaseYear].push(movie);
        });

        // sort each year bucket but the track name
        for (let key in yearBuckets) {
          yearBuckets[key] = sortBy(yearBuckets[key], ['trackName']);
        }

        // combine buckets, preserving proper year order, and flatten array
        combinedResults = flattenDeep(years.map(year => yearBuckets[year]));
      
        return dispatch({
          type: 'GET_MOVIES_SUCCESS',
          movies: combinedResults
        })
      })
  }
}


