const express = require('express');
const app = express();
const fs = require('fs');
const PORT = 3001;
const db = require('./db/db.json');
const uuid = require('./helpers/uuid');
const path = require('path');
//const { randomUUID } = require('crypto');

// implement middleware for the parsing of JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// this will search ./public folder to utilize everyting required for html files (i.e. serve static files from the '/public' folder)
app.use(express.static("public"));

// link home directory (here: http://localhost:3001) to /public/index.html
app.get('/',(req,res)=>{
   // these two approaches are identical, but I prefer the first one since it is more straightforward.
   res.sendFile(path.join(__dirname,'/public/index.html'))
   //res.sendFile(path.join(__dirname,'index.html'))
});

// notes.html for http://localhost:3001/notes
app.get('/notes',(req,res)=>{
   res.sendFile(path.join(__dirname,'/public/notes.html'))
});

// create a GET route for '/api/notes' that will return the content of our json file
app.get('/api/notes',(req,res)=>{
   // here, res.json() convert the object to a JSON string using the JSON.stringify() method, i.e., object -> string
   res.json(db);
});

// create a POST route for '/api/notes' that will add the user input to the saved db.json and show the updated db.json to the client
app.post('/api/notes',(req,res)=>{
   // Let the client know that their POST request was received (and show identical info to the terminal):
   console.log(`${req.method} request received`);

   // destructing assignment for the items in req.body:
   const {title, text} = req.body;

   // if all the required properties are present:
   if(title && text){
      fs.readFile('./db/db.json','utf8',(error,data)=>{
         // invoke old data first
         const old_data = data ? JSON.parse(data) : []; // if data exists, parse it, if not, create an empty array
         console.log("old_data: ", old_data);

         /* this is the first approach */
         // receive and create new data
         /*
         const new_data = {
            title,
            text
            //id: "2", // I will update this later
         };
         
         // add the "new_data" to the end of the "old_data" array
         old_data.push(new_data);
         
         // convert the new_data object to a string, so we can save it:
         const new_data_string = JSON.stringify(old_data);

         // overwrite the string to a file ./db/db.json
         fs.writeFile(`./db/db.json`,new_data_string,(err)=>
            err
               ? console.error(err)
               : console.log(
                  `${new_data.title} has been added to JSON file`
               )
         );
         */

         /* this is the second approach, and I prefer this 
            because the variable structure is more logically make sense.
         */
         //let uuid = self.crypto.randomUUID();
         // here, I just call uuid() function from ./helpers/uuid.js
         const temp_data = {
            title,
            text,
            id: uuid()
         };
         
         // add the "new_data" to the end of the "old_data" array
         const new_data = [].concat(old_data,temp_data)
         
         // convert the new_data object to a string, so we can save it:
         const new_data_string = JSON.stringify(new_data);
         //console.log(' ');
         //console.log(new_data_string);
         //console.log(' ');

         // overwrite the string to a file ./db/db.json
         fs.writeFile(`./db/db.json`,new_data_string,(err)=>{
            err? console.error(err) // if err is true, show the error
               : console.log(`${temp_data.title} has been added to JSON file`) // otherwise, show the log file
            }
         );

         const response = {
            status: 'success',
            body: new_data,
         }

         // The 201 status code is a response from the server that indicates the request was successfully processed 
         // and that the new resource has been created.
         console.log(response);
         res.status(201).json(response);
      })
   }
});

// create a DELETE route for '/api/notes/:id' that will delete the selected "id" data from db.json
app.delete('/api/notes/:id',(req,res)=>{
   if(req.body && req.params.id) {
      // show that their DELETE request was received:
      console.log(`${req.method} request received`);
      const id = req.params.id;

      fs.readFile('./db/db.json','utf8',(error,data)=>{
         // invoke old data first
         const old_data = data ? JSON.parse(data) : []; // if data exists, parse it, if not, create an empty array
         //console.log(old_data);
         //console.log(old_data[0]);
         //console.log(old_data[0].id);

         for(let i=0;i<old_data.length;i++){
            if(id === old_data[i].id){
               const del_data = old_data.splice(i,1); // store the deleting element to "del_data"
               const new_data = old_data;
               //console.log(i,id,new_data);
               //console.log(del_data);

               // convert the new_data object to a string, so we can save it:
               const new_data_string = JSON.stringify(new_data);

               // overwrite the string to a file ./db/db.json
               fs.writeFile(`./db/db.json`,new_data_string,(err)=>{
                  err? console.error(err) // if err is true, show the error
                     : console.log(`${del_data[0].title} has been removed from JSON file`) // otherwise, show the log file
                  }
               );

               const response = {
                  status: 'success',
                  body: new_data,
               }
      
               // The 201 status code is a response from the server that indicates the request was successfully processed 
               // and that the new resource has been created.
               console.log(response);
               res.status(201).json(response);                     
            }            
         }
      })
   }
});


// ===========================================================================================!
app.listen(PORT,()=>
   console.log(`Express server listening on port ${PORT}`)
);