const convert = require('xml-js');
const request = require('request');
const express = require('express');
const app = express();
const port = 8080

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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

////////////////////////////////////////////////////////////
app.get('/db/:id', getLaw, async(req, res) => {
    const category = req.params.id
    try{
        var result = req.json
        result.법령.조문.조문단위.map(item => savetodb(item, category))
        res.send("good")
    }catch(err){
        console.log(err)
        res.status(500).send({error:'Server Error.'});
    }
})

async function savetodb(item, category) {
    try{
        await prisma.law.create({
        data:{
            category: category,
            jomun: JSON.stringify(item)
        },
        })
    } catch (error) {
        console.error(error);
    }
}

app.get('/search/:id', async(req, res) => {
    const category = req.params.id
    var keyword = req.query.q;

    if(!(keyword == '조문' || keyword == '_attributes' || keyword == '조문키'||
        keyword == '조문번호' || keyword == '조문여부' || keyword == '조문제목' || keyword == '조문시행일자'
        || keyword == '조문이동이전' || keyword == '조문이동이후' || keyword == '조문이동여부' || keyword == '조문내용' 
        || keyword == '_text' || keyword == '_cdata' || keyword == '항' || keyword == '항번호' || keyword == '항내용'
        || keyword == '조' || keyword == '조번호' || keyword == '조내용' || keyword == '목' || keyword == '목번호'
        || keyword == '목내용' || keyword == '조문참고자료')){
        try{
            const result = await prisma.law.findMany({
                select: {
                    jomun: true
                },
                where: {
                    jomun: {
                        contains: keyword,
                    }, 
                    category: {
                        equals: category
                    }
                },
                orderBy: {
                    jomun: 'asc'
                },
            })
            if(result.length == 0) {
                res.send({ message: 'No result.' })
            }else {
                var response = result.map(item=>JSON.parse(item.jomun))
                res.send(response)
            }
    
        }catch(err){
            console.log(err)
            res.status(500).send({error:'Server Error.'});
        }
    }else {
        res.send({ message: 'No result.' })
    }
})
