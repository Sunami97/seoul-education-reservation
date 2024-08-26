require("dotenv").config();
const express = require("express");
const axios = require('axios');
const path = require("path");
const app = express()
const port = 3000
app.use(express.json());

app.get('/api/seoul', async (req, res) => {
    try {
        const { page = 1, size = 15, category = ' ', title = ' ', target = ' ', area = ' ' } = req.query;

        const startIndex = (page - 1) * size + 1;
        const endIndex = page * size;

        const url = `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_API_KEY}/json/ListPublicReservationEducation/${startIndex}/${endIndex}/${category}/${title}/${target}/${area}`;
        console.log(`Requesting URL: ${url}`);

        const response = await axios.get(url);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching data from Seoul API:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})