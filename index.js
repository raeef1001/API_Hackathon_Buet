import { Configuration, OpenAIApi } from "openai";
import { ocrSpace } from "ocr-space-api-wrapper"
import bodyParser from "body-parser";
import express from "express";
import  axios from 'axios';
import  cors from 'cors'

const app = express();
app.use(cors());
const encodedParams = new URLSearchParams();

app.set("port", process.env.PORT || 5000);

// Allows us to process the data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ROUTES

app.get("/", function (req, res) {
    res.send("fucking chatbot");
    
  });


// user variables
var ocrText;







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
      res.send(ocrText);
    } catch (error) {
      console.error(error);
    }
  }

// getting the prompt from user 
app.post('/text', async (req, res) => {
    const { prompt } = req.body;
    
let title = "The Adventures of Captain Lightning: A Supercharged Journey"
var command = `now write me a long story which token size will be less than 1000(its a must) and title will be ${title} and the story of this will be something ${prompt} and ok now i also have to include exact 2 images not more than that over here. i will use midjourney to generate the images. now you will write [image-$] where the "$" will be the order number of the image on every place i have to put an image and you will write the promt text for the image in {} this bracket following the [image-$].  that.   `

    brain(command,res)
    

})


app.post('/img', async (req, res) => {
    const { prompt } = req.body;
    var url = await pdf(prompt,res)
    
    
    

})
// variable and environment 

const configuration = new Configuration({
  organization: "org-VXz3tz6Dipkxrfkgiww3iuhr",
  apiKey:'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',
});
const openai = new OpenAIApi(configuration);

// openai text

async function brain(content,res) {
    console.log("started brain")
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: content }],
  });
  console.log(completion.data.choices[0].message);
   var reply = completion.data.choices[0].message.content;
   console.log(reply);
   var imglist = returnPrompts(reply)
   var linklist = await linkMaker(imglist)
   var replacedlink = replacePrompts(reply,linklist)
   var htmlDocument = await fixText(replacedlink)
   var pdffile = await pdf(htmlDocument,res)
   
   console.log(imglist);
   console.log(linklist)
   console.log(replacedlink)
   console.log(htmlDocument)
   console.log(pdffile)


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
    "custom_header": "<style>#header, #footer { padding: 0 !important; }</style>\n<table style=\"width: 100%; padding: 0px 5px;margin: 0px!important;font-size: 15px\">\n  <tr>\n    <td style=\"text-align:left; width:30%!important;\"><span class=\"date\"></span></td>\n    <td style=\"text-align:center; width:30%!important;\"><span class=\"pageNumber\"></span></td>\n    <td style=\"text-align:right; width:30%!important;\"><span class=\"totalPages\"></span></td>\n  </tr>\n</table>",
    "custom_footer": "<style>#header, #footer { padding: 0 !important; }</style>\n<table style=\"width: 100%; padding: 0px 5px;margin: 0px!important;font-size: 15px\">\n  <tr>\n    <td style=\"text-align:left; width:30%!important;\"><span class=\"date\"></span></td>\n    <td style=\"text-align:center; width:30%!important;\"><span class=\"pageNumber\"></span></td>\n    <td style=\"text-align:right; width:30%!important;\"><span class=\"totalPages\"></span></td>\n  </tr>\n</table>"
  }
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://rest.apitemplate.io/v2/create-pdf-from-html',
  headers: { 
    'Content-Type': 'application/json', 
    'X-API-KEY': 'b3acMTM4MTg6MTA4NzU6QVFucUZPWWw5VnhhMXA5ZA='
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
  console.log(response.data.download_url)
  res.send(response.data.download_url)
})
.catch((error) => {
  console.log(error);
});

}
// generate html 
// async function html(content) {
//     var actualDocument = `write me a html file to show the document where all the link followed by [image]  will be an image and you will use ' instead of \" in the whole html file. the document starts from here  : ${content}`
//     const response = await openai.createCompletion({
//         model: "text-davinci-003",
//         prompt: actualDocument,
//         max_tokens: 2500,
//         temperature: 0.7,
//       });
    
//     return response.data.choices[0].text
//     };
    

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
            imglist[key] =await imageGenerator( imglist[key] );
        }
        console.log(imglist)
        return imglist
    }

//openai image
async function imageGenerator(prompt) {
	console.log(`got the prompt inside image generator ${prompt}`);
	const result = await openai.createImage({
		prompt,
		n:1,
		size : "1024x1024",
		user: "user"
	
	})
	const url = result.data.data[0].url;
	console.log(`got the url form chatgpt ${url}`)
    return url;
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