import fetch from 'fetch-jsonp'
import moment from 'moment'

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

        //check error
        console.log(jsonResponses)

       /* <td><img src={movie.artworkUrl100} /></td>
        <td>{movie.releaseYear}</td>
        <td>{movie.trackName}</td>
        <td>{`$${movie.trackHdPrice}`}</td>
        <td>{movie.longDescription}</td> */

        const fullList = [...jsonResponses[0].results, ...jsonResponses[1].results];

        const combinedResults = fullList.map(movie => {
          return {
            artworkUrl100: movie.artworkUrl100,
            releaseYear: movie.releaseYear,
            trackHdPrice: movie.trackHdPrice,
            longDescription: movie.longDescription
          }
        })

        console.log(combinedResults)

        //
        // 1. combine the results of these requests
        // 2. sort the results FIRST by year THEN by title (trackName)
        // 3. each movie object in the results needs a releaseYear attribute added
        //    this is used in src/components/movies-list.js line 26
        //

        // const combinedResults = []

        return dispatch({
          type: 'GET_MOVIES_SUCCESS',
          movies: combinedResults
        })
      })
  }
}


