const express = require('express');
const router = express.Router();

const { addMemory, getMemories, editMemory, deleteMemory  } = require('../controllers/collegeMemoriesController');

router.post('/add-memory', addMemory);
router.get('/all-memories', getMemories);
router.put('/edit-memory/:memoryId', editMemory);
router.delete('/delete-memory/:memoryId', deleteMemory);

module.exports = router;