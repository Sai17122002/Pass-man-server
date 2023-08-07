const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({ 
    password: {
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true,
    },
    iv: {
        type: String,
        required: true
    },
    passcode: {
        type: String,
        required: true
    },  
    username: {
        type: String,
        required: true,
    }
})
const Pass = mongoose.model('Pass', passSchema);

module.exports = Pass;