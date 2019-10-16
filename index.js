console.log("starting up!!");

const express = require('express');
const methodOverride = require('method-override');
const pg = require('pg');

// Initialise postgres client
const configs = {
  user: 'garrick',
  host: '127.0.0.1',
  database: 'tunr_db',
  port: 5432,
};

const pool = new pg.Pool(configs);

pool.on('error', function (err) {
  console.log('idle client error', err.message, err.stack);
});

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(methodOverride('_method'));

// Set react-views to be the default view engine
const reactEngine = require('express-react-views').createEngine();
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', reactEngine);

/**
 * ===================================
 *  Artists Routes
 * ===================================
 */

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/artists', (req, res) => {
  const queryString = 'SELECT * FROM artists';
  pool.query(queryString, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        rows: result.rows
      };
      res.render('a-index', data);
    }
  });
});

app.get('/artists/new', (req, res) => {
  res.render('a-new');
});

app.post('/artists', (req, res) => {
  const queryArray = [req.body.name, req.body.photo_url, req.body.nationality];
  const queryString = 'INSERT INTO artists (name, photo_url, nationality) VALUES ($1, $2, $3) RETURNING *';
  pool.query(queryString, queryArray, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        rows : result.rows
      };
      res.render('a-create', data)
    }
  });
});

app.get('/artists/:id', (req, res) => {
  const queryArray = [req.params.id];
  const queryString = 'SELECT * FROM artists where ID = $1';
  pool.query(queryString, queryArray, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        id: req.params.id,
        rows : result.rows
      };
      res.render('a-show', data);
    }
  });
});

app.get('/artists/:id/edit', (req, res) => {
  const queryArray = [req.params.id];
  const queryString = 'SELECT * FROM artists where ID = $1';
  pool.query(queryString, queryArray, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        id: req.params.id,
        rows : result.rows[0]
      };
      res.render('a-edit', data);
    }
  });
});

app.put('/artists/:id', (req, res) => {
  const queryArray = [req.body.name, req.body.photo_url, req.body.nationality, req.params.id];
  const queryString = 'UPDATE artists SET name = $1, photo_url = $2, nationality = $3 WHERE id = $4';
  pool.query(queryString, queryArray, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        id: req.params.id,
        rows : req.body
      };
      res.render('a-update', data);
    }
  });
});

app.delete('/artists/:id', (req, res) => {
  console.log(req.params.id);
  const queryArray = [parseInt(req.params.id)];
  const queryString = `DELETE FROM artists WHERE id = $1 RETURNING *`;
  pool.query(queryString, queryArray, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        id: req.params.id,
        rows : req.body
      };
      res.render('a-delete', data);
    }
  });
})

/**
 * ===================================
 *  Songs Routes
 * ===================================
 */

app.get('/artists/:id/songs', (req, res) => {
  const queryArray = [req.params.id];
  const queryString = 'SELECT * FROM artists INNER JOIN songs ON (artists.id = songs.artist_id) where artists.id = $1';
  pool.query(queryString, queryArray, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        id: req.params.id,
        rows : result.rows
      };
      res.render('as-show', data);
    }
  });
});

app.get('/artists/:id/songs/new', (req, res) => {
  data = {
    id: req.params.id,
  };
  res.render('as-new', data);
});

app.post('/artists/:id/songs', (req, res) => {
  console.log(req.body);
  const queryArray = [req.body.title, req.body.album, req.body.preview_link, req.body.artwork, req.body.artist_id];
  const queryString = 'INSERT INTO songs (title, album, preview_link, artwork, artist_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  pool.query(queryString, queryArray, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        rows : result.rows
      };
      res.render('as-create', data)
    }
  });
});

 /**
 * ===================================
 *  Playlists Routes
 * ===================================
 */

app.get('/playlists/new', (req, res) => {
  res.render('p-new');
});

app.post('/playlists', (req, res) => {
  const queryArray = [req.body.name];
  const queryString = 'INSERT INTO playlists (name) VALUES ($1) RETURNING *';
  pool.query(queryString, queryArray, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        rows : result.rows
      };
      res.render('p-create', data)
    }
  });
});

app.get('/playlists/:id', (req, res) => {
  const queryArray = [req.params.id];
  const queryString = 'SELECT * FROM playlists INNER JOIN playlist_songs ON (playlists.id = playlist_songs.playlist_id) INNER JOIN songs ON (songs.id = playlist_songs.song_id) WHERE playlists.id = $1';
  pool.query(queryString, queryArray, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        id: req.params.id,
        rows : result.rows
      };
      res.render('p-show', data);
    }
  });
});

app.get('/playlists/:id/newsong', (req, res) => {
  const queryString = 'SELECT * FROM songs';
  pool.query(queryString, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        id: req.params.id,
        rows : result.rows
      };
      res.render('ps-new', data);
    }
  });
});

app.post('/playlists/:id', (req, res) => {
  const queryArray = [parseInt(req.params.id), req.body.id];
  const queryString = 'INSERT INTO playlist_songs (playlist_id, song_id) VALUES ($1, $2) RETURNING *';
  pool.query(queryString, queryArray, (err, result) => {
    if (err) {
      console.error('query error:', err.stack);
      res.send( 'query error' );
    } else {
      data = {
        rows : req.body
      };
      res.render('ps-create', data)
    }
  });
});

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
const server = app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));

let onClose = function(){
  
  console.log("closing");
  
  server.close(() => {
    
    console.log('Process terminated');
    
    pool.end( () => console.log('Shut down db connection pool'));
  })
};

process.on('SIGTERM', onClose);
process.on('SIGINT', onClose);
