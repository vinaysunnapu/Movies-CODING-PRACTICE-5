const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT movie_name FROM movie ORDER BY movie_id;
    `;
  const movie = await db.all(getMoviesQuery);
  response.send(
    movie.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `
    INSERT INTO
        movie (director_id,movie_name,lead_actor)
    VALUES 
        (
            
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );
  `;
  const updateMovie = await db.run(updateQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};
  `;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetails = `
    UPDATE 
        movie 
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
  `;
  const updateDetails = await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE FROM movie WHERE movie_id = ${movieId};
    `;
  const deleteMovie = await db.run(deleteQuery);
  response.send("Movie Removed");
});

const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 6
app.get("/directors/", async (request, response) => {
  const getDirector = `
        SELECT * FROM director ORDER BY director_id;
    `;
  const director = await db.all(getDirector);
  response.send(director.map((each) => convertDbObjectToResponseObject1(each)));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const movieQuery = `
        SELECT movie_name FROM movie WHERE director_id = ${directorId};
    `;
  const dMovie = await db.get(movieQuery);
  response.send(convertDbObjectToResponseObject1(dMovie));
});

module.exports = app;
