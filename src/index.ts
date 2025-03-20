import { createApp } from "./app.js";
import routerUser from "./routes/user.routes";
import routerAuth from "./routes/login.route";
import routerSummarize from "./routes/summarize.route";

const PORT: number | string = process.env.PORT || 5000;

const { app, port } = createApp( { port: PORT } );


app.use( ( err, req, res, next ) => {
  if ( err.code === 'LIMIT_UNEXPECTED_FILE' ) {
    return res.status( 400 ).json( { error: 'Unexpected file field.' } );
  }
} )

app.use( "/api/v1/user", routerUser );
app.use( "/api/v1/login", routerAuth );
app.use( "/api/v1/summarize", routerSummarize );


app.listen( port, () => {
  console.log( `Server is running at http://localhost:${PORT}` );
} );
