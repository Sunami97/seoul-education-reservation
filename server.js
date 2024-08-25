require("dotenv").config();
const express = require("express");
const axios = require('axios');
const path = require("path");
const app = express()
const port = 3000
app.use(express.json());

app.post('/api/seoul', async (req, res) => {
    try {
        const { startIndex, endIndex, category, title, target, area } = req.body;
        console.log(req.body);
        url = `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_API_KEY}/json/ListPublicReservationEducation/${startIndex}/${endIndex}/${category}/${title}/${target}/${area}`;
        const response = await axios.get(url);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})