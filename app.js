const convert = require('xml-js');
const request = require('request');
const express = require('express');
const app = express();
const port = 8080

app.listen(port, () => console.log('Example app listening on port 8080!'));

function getLaw(req, res, next) {
    const lawId = req.params.id
    var requestUrl = `https://www.law.go.kr/DRF/lawService.do?target=law&OC=rucy0716&type=XML&MST=${lawId}`
    request.get(requestUrl, (err,res,body) =>{
        if(err){
            console.log(`err => ${err}`)
        }
        else {
            if(res.statusCode == 200){
                var result = body
                var xmlToJson = convert.xml2json(result , {compact: true, spaces: 4});
                const json = JSON.parse(xmlToJson)
                req.json = json
                next();
            }
        }
    })
};

app.get('/law/:id', getLaw, async(req, res) => {
    try{
        var result = req.json
        res.send(result)
    }catch(err){
        console.log(err)
        res.status(500).send({error:'Server Error.'});
    }
})