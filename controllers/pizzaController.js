const pizzaModel = require('../models/pizzaModel')
const catchAsync = require('../utils/catchAsync')
exports.getAllPizzas= catchAsync(async (req,res,next)=>{
    const pizzas = await pizzaModel.find();
    res.status(200).json({
        status:'success',
        results:pizzas.length,
        data:{pizzas}
    })

})

exports.setAllPizzas= catchAsync(async (req,res,next)=>{
    const pizzas = await pizzaModel.create(req.body);
    res.status(200).json({
        status:'success',
        results:pizzas.length,
        data:{pizzas}
    })

})
exports.getPizza= catchAsync(async (req,res,next)=>{
    const pizza = await pizzaModel.findById(req.params.id)
    res.status(200).json({
        status:'success',
        results:pizza.length,
        data:{pizza}
    })
})