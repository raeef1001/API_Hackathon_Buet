const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const multer = require('multer');
const path = require('path');
const say = require('say')


const app = express();
const secret_key = "Oshayer";
const port = 3000;





///
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/"); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
      const filename = file.originalname;
      const renamedfilename = "target.txt";
      cb(null, renamedfilename); 
    },
  });
  
const upload = multer({ storage: storage });
///




app.use(express.json());

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://127.0.0.1:27017/Buet_hackathon_Users", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/savestory",(req,res) => {
    res.render("savestory");
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email : {
    type:String,
    required:true,
  }
});

const BookSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    body:{
        type:String,
        required:true,

    },

})

const User = mongoose.model("User", userSchema);
const Books = mongoose.model("Books",BookSchema);

app.post("/savestory",async(req,res)=>{
    const {title,body,image_url} = req.body;
    const newBooks = new Books({
        title,
        body,
        
    })
})


app.post("/register", async (req, res) => {
  const { username, password,email } = req.body;

  try {
    const existUser = await User.findOne({ username });
    if (existUser) {
      return res.status(409).json({ error: "Username already taken" });
    }
    const hashedpassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedpassword,
      email,
    });
    await newUser.save();

    const token = jwt.sign({ username:username }, secret_key, {
      expiresIn: "1h",
    });
    //res.json({ token });
    //res.send("Hello");
    res.render("register_to_login")
  } catch (error) {
    res.status(500).json({ error: "An error occured" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Password" });
    }
    const token = jwt.sign({ username:username }, secret_key, {
      expiresIn: "1h",
    });

    res.cookie("oshayerJWT", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 10000000),
    });

    //res.json({token});
    res.render("profile",{user:user})

    

   
    
  } catch (error) {
    res.status(500).json({ error: "An Error Occured ???" });
  }
});

// app.get('/protected',(req,res) => {
//     const token = req.headers.authorization;
//     if(!token){
//         return res.status(401).json({error : "No token given"});

//     }
//     jwt.verify(token,'secret_key',(error,decodec) => {
//         if(error){
//             return res.status(401).json({error: "Invalid Token"});
//         }
//         res.json({message :  "Access Granted"});
//     })
// })
// const checkLogin = (req,res,next)=>{
//   const {authorization} = req.headers;
//   try{
//     const token = authorization.split(' ')[1];
//     const decoded = jwt.verify(token,secret_key);
//     const {username} = decoded;
//     req.username = username;
//     next();

//   }
//   catch{
//     next("Authentication failure");

//   }

// }

// const checkLogin = (req,res,next)=>{
//   const authorization = req.cookies.token;
//   try{
//     const decoded = jwt.verify(authorization,secret_key);
//     const{username} = decoded;
//     req.username = username;
//     next();
//     res.send("Hello ???");

//   }
//   catch{
//     next("Authorization failed")
//   }
// }

function verifyToken(req, res, next) {
  const authorization = req.cookies.oshayerJWT;

  if(!authorization){
    return res.send("LOgin failed");
  }
  try{
    const decodedToken = jwt.verify(authorization,secret_key);
    req.username = decodedToken;
    next();


  }
  catch(error){
    return res.send("server error");


  }

  
}

app.get("/profile", (req, res) => {
    res.render("profile");
  });

app.get("/uploadfile",(req,res)=> {
    res.render("upload")
})



app.post("/upload",upload.single('file'),(req,res) => {
    if(!req.file){
        return res.status(400).send("No file uploaded");
    }
    else{
        res.send("OK");
    }
})


const buffer = fs.readFileSync("./uploads/target.txt");

const filecontent = buffer.toString();
//console.log(filecontent);
app.get("/saystory",(req,res) => {
    say.speak(filecontent);
    res.send("Ok")
} )






app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
