const express = require("express");
const path = require("path");
const dbpath = path.join(__dirname, "moviesData.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let db = null;
const initializeDbandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running http://localhost:3000/movie");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbandServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const movieNames = `SELECT movie_name
    from movie`;
  const moviedata = await db.all(movieNames);
  response.send(
    moviedata.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
//API update
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const movieNames = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES ('${directorId}','${movieName}','${leadActor}');`;
  const moviedata = await db.run(movieNames);
  response.send("Movie Successfully Added");
});

//api movie iD

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

//update

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const getMovieUpdate = `
    UPDATE
      movie
    SET
      director_id= '${directorId}',
      movie_name= '${movieName}',
      lead_actor= '${leadActor}'   
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.run(getMovieUpdate);
  response.send("Movie Details Updated");
});

//delete

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const Moviedelete = `
    DELETE 
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.run(Moviedelete);
  response.send("Movie Removed");
});

//director get

app.get("/directors/", async (request, response) => {
  const total = `SELECT
   director_id,director_name
    From director`;
  const moviedata = await db.all(total);
  response.send(
    moviedata.map((each) => convertDirectorDbObjectToResponseObject(each))
  );
});

//dir2
app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const movieN = `select movie_name
    from movie
    Where director_id= '${directorId}';`;
  const moviedata2 = await db.all(movieN);

  response.send(
    moviedata2.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
