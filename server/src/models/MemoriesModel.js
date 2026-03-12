const mongoose = require("mongoose");
const MemoriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },

    imageurl:{
        type: String
    },

    // category: {
    //     type: String
    // },
    reportCount:{
        type: Number,
        default: 0
    },

    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Memories', MemoriesSchema);