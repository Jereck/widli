const   express = require('express'),
        path = require('path'),
        crypto = require('crypto'),
        multer = require('multer'),
        GridFsStorage = require('multer-gridfs-storage'),
        Grid = require('gridfs-stream'),
        methodOverride = require('method-override'),
        bodyParser = require('body-parser'),
        mongoose = require('mongoose'),
        app = express();

//Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));
app.set("view engine", "ejs");

//connect to mongoose
const mongoURI = 'mongodb://jake:stella1011@ds251210.mlab.com:51210/widli';
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err){
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads',
                    metadata: req.body.selection,
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

app.get('/', function(req, res){
    res.render("index");
});

app.get('/megan', function(req, res){
    gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            res.render('megan', {files: false});
        } else {
            files.map(file => {
                if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                    file.isImage = true;               
                } else {
                    file.isImage = false;
                }
            });
            res.render('megan', {files: files});
        }
    });
});

app.get('/joe', function(req, res){
    gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            res.render('joe', {files: false});
        } else {
            files.map(file => {
                if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });
            res.render('joe', {files: files});
        }
    });
});

app.get('/contact', function(req, res){
    res.render('contact');
});

app.get('/admin', function(req, res){
    res.render("admin/admin");
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.redirect('/admin/#!/upload');
    console.log(req.file);
});

app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        return res.json(files);
    });
});

app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No such file exists'
            });
        }
        console.log(file);        
        return res.json(file);
    }); 
});


app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No such file exists'
            });
        }
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);          
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    }); 
});

app.get('/about', function(req, res){
    res.render('about');
});


// STORE //
app.get('/shop', (req, res) => {
    res.render("shop");
})

app.listen(3000, function(){
    console.log("Server is running");
});