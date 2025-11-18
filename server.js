const express = require('express');
const path = require('path');
const app = express();

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

app.use(express.static(PUBLIC_DIR));

function indexPage(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));    
}

app.get('/', indexPage);

app.listen(PORT, () => {
    var msg = 'Server running on port ' + PORT;
    console.log(msg);

}); //
