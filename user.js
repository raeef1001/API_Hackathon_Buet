
import mongoose from 'mongoose'

// (1) this is the scema model 
const userScema = new mongoose.Schema({
    name:String,
    age:Number
})


// (2) make the collection and export the model 
module.exports = mongoose.model('user',userScema)