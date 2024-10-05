const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const decodeToken = require('./middleware/decodeToken')

const process = require('process');
require('dotenv').config();

const cwd = process.cwd();

const path = require('path')
const fs = require('fs')
const formidable = require('formidable');

var app = express();

const allowedOrigins = [
    'http://localhost:5173'
];

// CORS options
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"]
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let url = "mongodb+srv://anderson:Ander123@cluster0.a8nau1r.mongodb.net/E-voting"
// let url = "mongodb+srv://kamsonganderson39:Ander123@cluster0.bl3bw.mongodb.net/OMEGA"

mongoose.connect(url)
    .then((con) => {
        console.log("Connected to the db")
    }
    )
    .catch(err => { console.log(err) })


app.get("/", (req, res) => {
    return res.send("Welcome to Tonti backend")
})
const userRoutes = require('./routers/user.router')
app.use("/api/user",userRoutes)
const tontineRoutes = require('./routers/tontine.router')
app.use("/api/tontine",tontineRoutes)
app.use("/images", express.static(path.join(process.cwd(), 'NIC')));
app.post('/api/uploadFile/:id', async (req, res) => {
    try {
        // Basic setup
        const id = req.params.id
        const form = new formidable.IncomingForm()
        const currentDir = cwd;
        // console.log("currentDir", currentDir);
        const uploadDir = path.join(currentDir, 'NIC');
        fs.mkdirSync(uploadDir, { recursive: true });
        // Basic Configuration
        form.multiples = true
        form.maxFileSize = 50 * 1024 * 1024 // 5MB
        form.uploadDir = uploadDir
        let imageFiles = []
        // Parsing
        await form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log('Error parsing the files', err)
                return res.status(400).json({
                    error: 'There was an error parsing the files',
                })
            }
            // console.log("files.image :", files.images.length)
            imageFiles = files.images;
            // console.log("good here");
            if (!imageFiles) {
                return res.status(400).send({ error: 'No files were uploaded.' });
            }
            let names = []
            for (let index = 0; index < imageFiles.length; index++) {
                let oldPath = uploadDir + '/' + imageFiles[index].newFilename
                let newPath = uploadDir + '/' + id
                fs.renameSync(oldPath, newPath);
            }
            // console.log(imageStr);
            return res.status(400).json({
                message: 'Ok ',
            })
        })
    } catch (err) {
        console.log(err)
        return res.status(501).send({ error: 'Server error.' });
    }
});
app.post("/api/payment", decodeToken, async (req, res) => {
    let {
        phone,
        amount
    } = req.body

    const headersList = {
        'Authorization': `Token 0675a6a0848213fb0dc2ea6ac15a042e8d285d75`,
        'Content-Type': 'application/json'
    }
    const bodyContent = JSON.stringify({
        "amount": amount.toString(),
        "from": "237" + phone,
        "description": "Tontine Application",
        "external_reference": uuidv4()
    });
    try {
        const response = await fetch(`https://www.campay.net/api/collect/`, {
            method: "POST",
            body: bodyContent,
            headers: headersList
        });
        const paymentStatusResponse = await response.json();
        console.log("paymentStatusResponse", paymentStatusResponse)
        return res.status(200).json(paymentStatusResponse)

    } catch (error) {
        console.error("Error initialing payment:", error);
        return res.status(400).send({ message: "Transaction failed please start back", statusError: true })
    }
})
app.put("/api/verify/:id", decodeToken, async (req, res) => {
    let {
        phone,
    } = req.body
    const headersList = {
        'Authorization': `Token 0675a6a0848213fb0dc2ea6ac15a042e8d285d75`,
        'Content-Type': 'application/json'
    }
    try {
        const response = await fetch(`https://www.campay.net/api/transaction/${req.params.id}/`, {
            method: "GET",
            headers: headersList
        })
        const paymentStatusResponse = await response.json();
        console.log()
        if (paymentStatusResponse.status === "SUCCESSFUL") {
            const userId = req.userId;
            const user = await UserModel.findById(userId);
            // user.balance = paymentStatusResponse.amount
            user.transactions.push({
                // amount: paymentStatusResponse.amount,
                type: "CashIn"
            });
            user.save();
        }
        return res.status(200).json(paymentStatusResponse)
    } catch (error) {
        console.error("Error polling payment status:", error);
        return res.status(500).json({ message: "Server error" })
    }
})
app.get("*", (req, res) => {
    return res.send("Not found")
})


let server = app.listen(5000, async () => {
    console.log("Server running on port 5000");
})