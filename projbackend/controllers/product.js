const Product=require("../models/product")
const formidable=require("formidable")
const _=require("lodash")
const fs=require("fs")

exports.getProductById=(req,res,next,id)=>{
    Product.findById(id)
    .populate("category")
    .exec((err,product)=>{
        if(err){
            return res.status(400).json({
                error:"product not found"
            })
        }
        req.product=product;
        next();
    })
}
exports.createProduct=(req,res)=>{
    let form=new formidable.IncomingForm();
    form.keepExtentions=true;

    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error:"problem with image"
            })
        }

        const {name,description,price,category,stock}=fields;
        if(!name|| !description || !price || !price ||!category ||!stock){
            return res.status(400).json({
                error:"all fields are required"
            })
        }
        //TODO:restrictions

        let product=new Product(fields)
        //file handling
        if(files.photo){
            if(files.photo.size>3000000){
                return res.status(400).json({
                    error:"file size is too Big!"
                })
            }
            product.photo.data=fs.readFileSync(files.photo.path)
            product.photo.contentType=files.photo.type
        }
        //save to db

        product.save((err,product)=>{
            if(err){
                return res.status(400).json({
                    error:"saving product were failed"
                })
            }
            res.json(product)
        })
    })
}

exports.getProduct=(req,res)=>{
    req.product.path=undefined;
    return res.json(req.product)

}

exports.photo=(req,res,next)=>{
    if(req.product.photo.data){
        res.set("content-Type",req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next();
}

exports.deleteProduct=(req,res)=>{
    let product=req.product;
    product.remove((err,deletedProduct)=>{
        if(err){
            return res.status(400).json({
                error:"failed to delete"
            })
        }
        res.json({
            message:"deletion was successful",
            deletedProduct
        })
    })
}

exports.updateProduct=(req,res)=>{
    
    let form=new formidable.IncomingForm();
    form.keepExtentions=true;

    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error:"problem with image"
            })
        }

       
        //code for update
        let product=req.product;
        product=_.extend(product,fields)
        //file handling
        if(files.photo){
            if(files.photo.size>3000000){
                return res.status(400).json({
                    error:"file size is too Big!"
                })
            }
            product.photo.data=fs.readFileSync(files.photo.path)
            product.photo.contentType=files.photo.type
        }
        //save to db

        product.save((err,product)=>{
            if(err){
                return res.status(400).json({
                    error:"Update failed"
                })
            }
            res.json(product)
        })
    })

}

exports.getAllProduct=(req,res)=>{
    let limit=req.query.limit ? parseInt(req.query.limit):8
    let sortBy=req.query.sortBy ? req.query.sortBy :"_id"


    Product.find()
    .select("-photo")
    .populate("category")
    .limit(limit)
    .sort([[sortBy,"asc"]])
    .exec((err,products)=>{
        if(err){
            return res.status(400).json({
                error:"product not found"
            })
        }
        res.json(products)
    })
}

exports.getAllUniqueCategory=(req,res)=>{
    Product.distinct("category",{},(err,category)=>{
        if(err){
            return res.status(400).json({
                error:"Thereis no category found"
            })
        }
        res.json(category);

    })
}

exports.updateStock = (req,res,next)=>{
    let myOperations = req.body.order.products.map(prod=>{
        return{
            updateOne:{
                filter:{_id:prod._id},
                update:{$inc:{stock:-prod.count , sold: -prod.count}}
            }
        }
    })
    Product.bulkWrite(myOperations,{},(err,products)=>{
        if(err){
            return res.status(400).json({
                error:"Bulk operation failed"
            })
        }
        next()
    })
}

