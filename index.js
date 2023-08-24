const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const newspapers = [
    {
        name: 'cityam',
        address: 'https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/',
        base: ''
    },
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: ''
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        base: 'https://www.telegraph.co.uk',
    },
    {
        name: 'sun',
        address: 'https://www.thesun.co.uk/topic/climate-change-environment/',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: '',
    },
    {
        name: 'nyt',
        address: 'https://www.nytimes.com/international/section/climate',
        base: '',
    },
    {
        name: 'latimes',
        address: 'https://www.latimes.com/environment',
        base: '',
    },
    {
        name: 'smh',
        address: 'https://www.smh.com.au/environment/climate-change',
        base: 'https://www.smh.com.au',
    },
    {
        name: 'bbc',
        address: 'https://www.bbc.co.uk/news/science_and_environment',
        base: 'https://www.bbc.co.uk',
    },
    {
        name: 'es',
        address: 'https://www.standard.co.uk/topic/climate-change',
        base: 'https://www.standard.co.uk'
    },
    {
        name: 'dm',
        address: 'https://www.dailymail.co.uk/news/climate_change_global_warming/index.html',
        base: ''
    },
    {
        name: 'nyp',
        address: 'https://nypost.com/tag/climate-change/',
        base: ''
    }
]

const articles = []

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
            })

        })
})


app.get('/', (req, res) => {
    res.json('Welcome to my Climate Change News API')
})

app.get('/news', (req, res) => {

    res.json(articles)
})

app.get('/weather/:city', async (req, res) => {

    try {
        const city = req.params.city
        const url = "https://www.google.com/search?q=weather+" + city;
    
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
    
        const temp = $('.BNeawe.iBp4i.AP7Wnd').text();
        const str = $('.BNeawe.tAd8D.AP7Wnd').text();
        const data = str.split('\n');
        const time = data[0];
        const sky = data[1];
    
        const listDiv = $('.BNeawe.s3v9rd.AP7Wnd');
        const strd = $(listDiv[5]).text();
        const pos = strd.indexOf('Wind');
        const otherData = strd.substring(pos);
    
        const result = {
          temperature: temp,
          time: time,
          skyDescription: sky,
          otherData: otherData
        };
    
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
      }

    // const url = "https://www.google.com/search?q="+"weather"+cityName
    // const html = axios.get(url).then(result =>{
    //     const htmlData = result.data
    //     const $ = cheerio.load(htmlData)

        
    //     $('a:contains("weather")', html).each(function () {
    //         const title = $(this).text()
    //         const url = $(this).attr('BNeawe s3v9rd AP7Wnd')

    //     })
    // })
    
})

app.get('/news/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId

    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base


    axios.get(newspaperAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })
            res.json(specificArticles)
        }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))
