const express = require('express')

const multer = require('multer')
const path = require('path')
const ejs = require('ejs')

const morgan = require('morgan')
const favicon = require('serve-favicon')
const { success } = require('./helpers.js')
let videos = require('./listeVideo')


const storage = multer.diskStorage({
    destination : path.join(__dirname,'src','uploads'),
    filename : (req,file,callback)=>{
        callback(null,`${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
})

const upload = multer({
    storage : storage,
    limits : {
        fileSize : 300000000
    },
    fileFilter : (req,file,callback)=>{

        const prExt = /jpg|jpeg|png|gif/;
        const checkExt = prExt.test(path.extname(file.originalname));
        const checkmime = prExt.test(file.mimetype);


        if(checkExt && checkmime){
            callback(null,true)
        }else{
            callback('image seulement !');
        }

    }
}).single('cocktail');


const app = express()
const port = 4000

app
    .use('/public', express.static(path.join(__dirname,'src')))
    .post('/upload',(req,res)=>{
        upload(req,res,err=>{
            if(err){
                res.render('index',{
                    error : err
                })
            }else{
                if(req.file !== undefined){
                    res.render('index',{
                        file : req.file.filename
                    })
                }else{
                    res.render('index',{
                        error: 'champ vide'
                    })
                }
            }
        })
    })
    .set('view engine', 'ejs')
    .use(favicon(__dirname + '/favicon.ico'))
    .use(morgan('dev'))


app.get('/', (req,res) => res.render('index'))


/////////////////////////////////////////////////////////////////////////////////////////////////

// on retourne la liste des vidéos au format JSON, avec un message:
app.get('/api/videos', (req,res) => {
    const message = 'la liste des vidéos a bien été récupérée'
    res.json(success(message, videos))
})

app.get('/api/videos/:id', (req,res) => {
    const id = parseInt(req.params.id)
    const video = videos.find(video => video.id === id)
    const message = 'la vidéo a été trouvé !'
    res.json(success(message, video))
    })


app.listen(port, () => console.log(`video menthe, le programme démarrée sur: http://localhost:${port}`))