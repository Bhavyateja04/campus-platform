const mongoose=require('mongoose');

const CommunitySchema= new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String
    },
    category:{
        type:String
    },
    // authorId:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required:true
    // },
    createdAt:{
        type: Date,
        default: Date.now
    }
});
module.exports=mongoose.model('Community',CommunitySchema);   
