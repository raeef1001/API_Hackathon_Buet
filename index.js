var { Configuration, OpenAIApi } = require ("openai")
var { ocrSpace } = require ( "ocr-space-api-wrapper")
var bodyParser = require( "body-parser");
var express = require( "express");
var  axios = require ('axios');
var  cors = require('cors')
require('dotenv/config')
// import mongoose from 'mongoose'
// import bcrypt from "bcrypt";
// import jwt from  "jsonwebtoken";
// import say from "say";
// import cookieParser from "cookie-parser"
const app = express();
app.use(cors());
const encodedParams = new URLSearchParams();

app.set("port", process.env.PORT || 5000);

// Allows us to process the data
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES
// app.set("view engine", "ejs");


// app.get("/register", (req, res) => {
//     res.render("register")
//   });

//   app.get("/login", (req, res) => {
//     res.render("login");
//   });
  
  

app.get("/", function (req, res) {
    res.send("api hackathon");
    
  });


// user variables
var ocrText;


// connecting to the mongoose server
const uri = "mongodb+srv://admin:admin@demo.bxfwjq6.mongodb.net/againUser?retryWrites=true&w=majority";
// (2) againUser is the database name

// //  (3) connect to the database 

// mongoose.connect(uri)
// .then(()=>console.log('connected to server'))
// .catch((err)=>console.log(err))



// const userSchema = new mongoose.Schema({
//     username: {
//       type: String,
//       unique: true,
//       required: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     email : {
//       type:String,
//       required:true,
//     }
//   });
//   const pdfSchema = new mongoose.Schema({
//     title: {
//       type: String,
//     },
//     url : {
//       type:String,
    
//     },
//     body : {
//         type:String,
//       }
//   });

//   const User = mongoose.model("User", userSchema);
//   const BOOK = mongoose.model("BOOK", pdfSchema);

//   app.post("/register", async (req, res) => {
//     const { username, password,email } = req.body;
  
  
//     try {
//       const existUser = await User.findOne({ username });
//       if (existUser) {
//         return res.status(409).json({ error: "Username already taken" });
//       }
//       const hashedpassword = await bcrypt.hash(password, 10);
  
  
//       const newUser = new User({
//         username,
//         password: hashedpassword,
//         email,
//       });
//       await newUser.save();
  
  
//       const token = jwt.sign({ username:username }, secret_key, {
//         expiresIn: "1h",
//       });
//       //res.json({ token });
//       //res.send("Hello");
//       res.send("Registration completed successfully")
//     } catch (error) {
//       res.status(500).json({ error: "An error occured" });
//     }
//   });




//   app.post("/login", async (req, res) => {
//     const { username, password } = req.body;
//     try {
//       const user = await User.findOne({ username });
//       if (!user) {
//         return res.status(401).json({ error: "Invalid username" });
//       }
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) {
//         return res.status(401).json({ error: "Invalid Password" });
//       }
//       const token = jwt.sign({ username:username }, secret_key, {
//         expiresIn: "1h",
//       });
  
  
//       res.cookie("oshayerJWT", token, {
//         httpOnly: true,
//         expires: new Date(Date.now() + 10000000),
//       });
  
  
//       //res.json({token});
//       res.send("Login successful")
  
  
     
  
  
     
     
//     } catch (error) {
//       res.status(500).json({ error: "An Error Occured ???" });
//     }
//   });
  




//   function verifyToken(req, res, next) {
//     const authorization = req.cookies.oshayerJWT;
  
  
//     if(!authorization){
//       return res.send("LOgin failed");
//     }
//     try{
//       const decodedToken = jwt.verify(authorization,secret_key);
//       req.username = decodedToken;
//       next();
  
  
  
  
//     }
//     catch(error){
//       return res.send("server error");
  
  
  
  
//     }
  
  
   
//   }
  
  




///////////////////////////////////////////////////////////////////////////////////////


   


// ocr analysis
app.get("/ocr/:id", (req, res) => {
    //console.log(req.params.id)
    main(req.params.id, res);
  });
  async function main(url, res) {
    console.log(url);
    try {
      // Using the OCR.space default free API key (max 10reqs in 10mins) + remote file
      const res1 = await ocrSpace(url);
      ocrText = res1.ParsedResults[0].ParsedText;
      console.log(ocrText)
      var url = await chat(ocrText,res)
    } catch (error) {
      console.error(error);
    }
  }

// getting the prompt from user 
app.post('/text', async (req, res) => {
    const { prompt } = req.body;
    
let title = ""
var command = `now write me a long story which token size will be less than 1000(its a must)  and the story of this will be something ${prompt} and ok now i also have to include exact 2 images not more than that over here. i will use midjourney to generate the images. now you will write [image-$] where the "$" will be the order number of the image on every place i have to put an image and you will write the promt text for the image in {} this bracket following the [image-$].  that.   `

    brain(command,res)
    

})


app.post('/chat', async (req, res) => {
    const { prompt } = req.body;
    var url = await chat(prompt,res)
    
    
    

})
// variable and environment 

const configuration = new Configuration({
  organization: "org-VXz3tz6Dipkxrfkgiww3iuhr",
  apiKey:process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

// chat-gpt 

async function chat(content,res) {
    console.log("started brain")
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: content }],
  });
  console.log(completion.data.choices[0].message);
   var reply = completion.data.choices[0].message.content;
   console.log(reply);
   res.send(reply)


}

// title generation
async function title(content) {
    console.log("started brain")
    content = `make a title form this story : ${content}`;
    try {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: content }],
  });
  console.log(completion.data.choices[0].message);
   return completion.data.choices[0].message.content;
}catch (error) {
    console.error(error);
  }

}
// openai text

async function brain(content,res) {
    console.log("started brain")
    try {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: content }],
  });
  console.log(completion.data.choices[0].message);
   var reply = completion.data.choices[0].message.content;
   console.log(reply);
   var imglist = returnPrompts(reply)
  // var Title = await title(reply)
   var linklist = await linkMaker(imglist)
   var replacedlink = replacePrompts(reply,linklist)
   var htmlDocument = await fixText(replacedlink)
   var pdffile = await pdf(htmlDocument,res)
   
   console.log(imglist);
   console.log(linklist)
   console.log(replacedlink)
   console.log(htmlDocument)
   console.log(pdffile)
}catch (error) {
    console.error(error);
  }

}
// pdf generator 
async function pdf(datapdf,res) {
    var extendedHTML = `<!DOCTYPE html><head> <title>Document</title> <style> p { color: rgba(52, 73, 94, 1); font-size: 160%; text-align: left; padding-bottom: 10px; white-space: pre-wrap; overflow: visible; font-family: 'Roboto Serif'; font-size: 25px; font-weight: 400; letter-spacing: 0.1px; line-height: 1.6; border-radius: 0px; -moz-border-radius: 0px; opacity: 1; align-self: center; min-width: 0px; order: 1; min-height: 0px; height: max-content; flex-grow: 0; flex-shrink: 0; width: auto; margin-left: 0px; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; z-index: 2; text-align: center; } img{ border-radius: 25px; width: 50%; } </style></head><body>${datapdf}`
let data = JSON.stringify({
  "body": `${extendedHTML}`,
  "css": "<style>.bg{backgound: red};</style>",
  "settings": {
    "paper_size": "A4",
    "orientation": "1",
    "header_font_size": "9px",
    "margin_top": "40",
    "margin_right": "10",
    "margin_bottom": "40",
    "margin_left": "10",
    "print_background": "1",
    "displayHeaderFooter": true,
    "custom_header": "<style>#header, #footer { padding: 0 !important; }</style>\n<table style=\"width: 100%; padding: 0px 5px;margin: 0px!important;font-size: 15px\">\n  <tr>\n    <td style=\"text-align:left; width:30%!important;\"></td>\n    <td style=\"text-align:center; width:30%!important;\"><span class=\"pageNumber\"></span></td>\n    <td style=\"text-align:right; width:30%!important;\"><span class=\"totalPages\"></span></td>\n  </tr>\n</table>",
    "custom_footer": "<style>#header, #footer { padding: 0 !important; }</style>\n<table style=\"width: 100%; padding: 0px 5px;margin: 0px!important;font-size: 15px\">\n  <tr>\n    <td style=\"text-align:left; width:30%!important;\"></td>\n    <td style=\"text-align:center; width:30%!important;\"><span class=\"pageNumber\"></span></td>\n    <td style=\"text-align:right; width:30%!important;\"><span class=\"totalPages\"></span></td>\n  </tr>\n</table>"
  }
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://rest.apitemplate.io/v2/create-pdf-from-html',
  headers: { 
    'Content-Type': 'application/json', 
    'X-API-KEY': process.env.X_API_KEY 
  },
  data : data
};

axios.request(config)
.then(async(response) => {
  console.log(JSON.stringify(response.data));
//     var pdffile = response.data.download_url
//   const newpdf = new BOOK({
//     Title,
//     pdffile,
//     reply
//   })
//   await newpdf.save()
  var filedata =  response.data.download_url
  res.send(filedata)
  return response.data.download_url
})
.catch((error) => {
  console.log(error);
});

}

// html generator  
const fixText = (text,res) => {
    text = "<p>" + text;
    text = text.replaceAll("\n\n", "\n");
    text = text.replaceAll("\n", "</p><p>");
    text += "<p>";

    for (let i = 1; i <= 5; i++) {
        text = text.replace([`image-${i}`], "");
    }
    text = text.replaceAll("[https", "<img src='https");
    text = text.replaceAll("]", "'>");
    return text;
}
        
        
        
      
// link replacements
const replacePrompts=(txt, urls)=>{
    let count = 1; 
    while(true){
        let index1 = txt.indexOf("{"), index2 = txt.indexOf("}");
        if(index1==-1) break;
        let txt_a = txt.substring(0, index1);
        let txt_b = txt.substring(index2+1);
        txt = txt_a + "["+ urls[`image${count}`] + "]" + txt_b;
        count++;
        txt = txt.replace("[image]", "");
    }
    return txt;
}



// image link generator
async function linkMaker(imglist) {
    
        for(let key in imglist){
            try {
            imglist[key] =await imageGenerator( imglist[key] );
            } catch (error) {
                console.log(error);
    
        }
        console.log(imglist)
        return imglist
    }
}
//openai image
async function imageGenerator(prompt) {
	console.log(`got the prompt inside image generator ${prompt}`);
    try {
	const result = await openai.createImage({
		prompt,
		n:1,
		size : "1024x1024",
		user: "user"
	
	})
	const url = result.data.data[0].url;
	console.log(`got the url form chatgpt ${url}`)
    return url;
}catch (error) {
        console.error(error);
      }
  }


// image prompt extrction 
const returnPrompts=(txt)=>{
    let count = 1, MainObject = {};
    while(true){
        let index1 = txt.indexOf("{"), index2 = txt.indexOf("}");
        if(index1 == -1) break;
        //console.log( txt.substring( index1 + 1, index2) )
        MainObject[`image${count}`] = txt.substring( index1 + 1, index2 );
        count++;
        let txt_a = txt.substring(0, index1);
        let txt_b = txt.substring(index2+1);
        txt = txt_a + txt_b;
        txt = txt.replace("[image]", "");
    }
    console.log(1000)
   // console.log(MainObject)
    return MainObject;
}































app.listen(app.get("port"), function () {
  console.log("running: port");
});