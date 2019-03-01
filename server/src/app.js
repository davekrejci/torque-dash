const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(express.json());
app.use(morgan('combined'));

app.use('/hello', (req, res) => {
    res.send({
        message: 'Hello World!'
    });
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`));

