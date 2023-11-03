
// server/index.js

const express = require("express");

const PORT = process.env.PORT || 3001;

const cors = require('cors')

const app = express();

const {spawn} = require('child_process');

const bodyParser = require('body-parser');

const fs = require('fs');

var https = require('https');

var jsonParser = bodyParser.json()

app.post('/register',jsonParser,(req, res) => {
	console.log(req.body);
	let response = {"status":201,"message": "Successfully Registered"};
	const username = req.body.user;
	const password = req.body.pwd;
	const credentials = {"user":username, "password":password};
	let credentialsArray = [];
	try {
 		 const jsonString = fs.readFileSync('/home/lukash/PI-Projekt-React-Backend/server/user.json', 'utf8');
 		 credentialsArray = JSON.parse(jsonString);
		} catch (error) {
		console.log(error);
 		response.status = 400;
		response.message = error;
		}
	if(credentialsArray.length > 0){
		const filterdArray = credentialsArray.filter(item => item.username===credentials.username);
		if(filterdArray.length > 0){
			console.log("User already exists");
			response.status = 409;
			response.message = "User already exists";
		}
	}
	if(filterdArray.length == 0){
		credentialsArray.push(credentials);
		console.log("credentials added");
	}
	const updatedJsonString = JSON.stringify(credentialsArray);
	fs.writeFileSync('/home/lukash/PI-Projekt-React-Backend/server/user.json', updatedJsonString, 'utf8');
	res.status(response.status).json({message:response.message, status: response.status});

});


app.post('/login',jsonParser,(req, res) => {
	const username = req.body.user;
        const password = req.body.pwd;
	let response = {"status":201,"message": "Successfully Registered"};
	let sessionArray = [];
	let userArray =[];
	let random = Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
	let session = {"user": username, "password": password, sessionId: random };
        try {
                 const jsonString = fs.readFileSync('/home/lukash/PI-Projekt-React-Backend/server/sessions.json', 'utf8');
		 const userJsonString = fs.readFileSync('/home/lukash/PI-Projekt-React-Backend/server/user.json', 'utf8');
                 sessionArray = JSON.parse(jsonString);
		 userArray = JSON.parse(userJsonString);
                } catch (error) {
                console.log(error);
                response.status = 400;
                response.message = error;
                }
	let filterdArray = [];
	const filterdUserArray = userArray.filter(item => item.username===session.username);
        if(sessionArray.length > 0){
               filterdArray = sessionArray.filter(item => item.username===session.username);
        }
	if(filterdUserArray.length == 0){
		response.status = 400;
                response.message = "User does not exists";
	}else if (password !== filterdUserArray[0].password){
		response.status = 400;
                response.message = "invalid password";
	}
        else if(filterdArray.length > 0){
               let index = sessionArray.indexOf(filterdArray[0]);
		sessionArray[index].sessionId = session.sessionId;
        }else{
		sessionArray.push(session);
	}
        const updatedJsonString = JSON.stringify(sessionArray);
        fs.writeFileSync('/home/lukash/PI-Projekt-React-Backend/server/sessions.json', updatedJsonString, 'utf8');
        res.status(response.status).json({session});
});

app.post('/scannedItems',jsonParser,(req, res) => {	
	var largeDataSet = [];
        console.log(req.body);
        const jsonString = fs.readFileSync('/home/lukash/PI-Projekt-React-Backend/server/sessions.json', 'utf8');
        sessionArray = JSON.parse(jsonString);
        const filterdArray = sessionArray.filter(item => item.username===req.body.username);
	if(filterdArray.length == 1 && filterdArray[0].password === req.body.pwd && filterdArray[0].sessionId === req.body.sessionId){
		const productsJsonString = fs.readFileSync('/home/lukash/PI-Projekt-React-Backend/server/productdata.json');
                let productArray = JSON.parse(productsJsonString);
		console.log(productArray);
		res.status(200).json({productArray});

	}else{
		res.status(401).json({message:'Zugriff verweigert', status:401});
	}
});
		
app.post('/scanItems',jsonParser,(req, res) => {
        var largeDataSet = [];
	let response = {"status":201,"message": "Successfully Registered"};
	console.log(req.body);
	const jsonString = fs.readFileSync('/home/lukash/PI-Projekt-React-Backend/server/sessions.json', 'utf8');
	sessionArray = JSON.parse(jsonString);
	const filterdArray = sessionArray.filter(item => item.username===req.body.username);
	if(filterdArray.length == 1 && filterdArray[0].password === req.body.pwd && filterdArray[0].sessionId === req.body.sessionId){
       		 const python = spawn('python3', ['/home/lukash/PI-Projekt-React-Backend/server/scanItem.py']);
       		 python.stdout.on('data', function (data) {
                	console.log('Pipe data from python script ...');
                	largeDataSet.push(data.toString().replace(/(\r\n|\n|\r)/gm, ""));
        	 });
       		 python.on('close', (code) => {
        	        console.log(`child process close all stdio with code ${code}`);
			console.log(largeDataSet);
                	var get_options = {
                		 host: 'shop.rewe.de',
                		 path: '/api/suggestions?q='+ largeDataSet[0],
                		 method: 'GET',
                		 headers: {
                       			 'Cookie': 'marketsCookie=%7B%22online%22%3A%7B%22wwIdent%22%3A%221940419%22%2C%22marketZipCode%22%3A%2256073%22%2C%22serviceTypes%22%3A%5B%22PICKUP%22%5D%2C%22customerZipCode%22%3A%2256072%22%7D%2C%22stationary%22%3A%7B%22wwIdent%22%3A%221765243%22%2C%22marketZipCode%22%3A%2256072%22%2C%22serviceTypes%22%3A%5B%22STATIONARY%22%5D%7D%7D'
                       		 }
                	 };
			 var get_req = https.request(get_options, function(res) {
                        	res.setEncoding('utf8');
                        	res.on('data', function (content) {
					console.log(content);
					const fetchedContent = content;
					console.log(fetchedContent);
                                	const productsJsonString = fs.readFileSync('/home/lukash/PI-Projekt-React-Backend/server/productdata.json');
		                        let productArray = JSON.parse(productsJsonString);
                		        let filterdProductArray = [];
                        		if(productArray.length != 0){
                                		const filterdProductArray = productArray.filter(item => item.username===req.body.username);
					}
                        		if(filterdProductArray.length == 0){
						let user = req.body.user;
						const contenObj = JSON.parse(content);
						const products = contenObj.products;
						console.log(products);
                               			let userProducts = {
                                        		user: user,
                                        		scannedProducts: products
                                		}
                                		console.log(content)
                                		console.log(userProducts);
                                		productArray.push(userProducts);
                        		}else{
                          			let index = productArray.indexOf(filterdProductArray[0]);
                          			productArray[index].scannedProducts.push(content.products[0]);
                        		    }
					const productsJson = JSON.stringify(productArray); 
					fs.writeFileSync('/home/lukash/PI-Projekt-React-Backend/server/productdata.json', productsJson, 'utf8');

                        	 });
                	 });
			get_req.end();
		 });
	}else {
		response.message = "Fehlerhafte Login-Daten";
		response.status = 401;
	}  
	res.status(response.status).json({message:response.message, status: response.status});
});


app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

