const express = require('express');
const router = express.Router();
const { addCanteen, getCanteens, getCanteenById, updateCanteen, deleteCanteen } = require('../controllers/canteensController');

router.post('/add-canteen', addCanteen);
router.get('/all-canteens', getCanteens);
router.get('/canteen/:canteenId', getCanteenById);
router.put('/edit-canteen/:canteenId', updateCanteen);
router.delete('/delete-canteen/:canteenId', deleteCanteen);

module.exports = router;

