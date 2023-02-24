let express = require('express');
let app = express();

app.get('/MOMA', function(req, res){
   res.send("Cinema System");
});

app.listen(3000);