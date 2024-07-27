const User=require("../models/user");
const Order=require("../models/order");
const products = require("../models/product");

exports.getUserById=(req,res,next , id)=>{
    User.findById(id).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:"No usre found"
            });
        }
        req.profile=user;
        next();
    })
}
exports.getUser=(req,res)=>{
    req.profile.salt=undefined;
    req.profile.encry_password=undefined;
    req.profile.createdAt=undefined;
    req.profile.updatedAt=undefined;
    return res.json(req.profile);
}
exports.getAllUsers=(req,res)=>{
    User.find().exec((err,users)=>{
        if(err || !users){
            return res.status(400).json({
                error:"No users found"
            })
        }
        res.json(users);

    })
}
exports.updateUser=(req,res)=>{
    User.findByIdAndUpdate(
        {_id:req.profile._id},
        {$set:req.body},
        {new:true,useFindAndModify:false},
        (err,user)=>{
            if(err){
               return res.status (400).json({
                error:"you are not able to update"
               })
            }
            user.salt=undefined;
            user.encry_password=undefined;
            res.json(user)
        }
    )
}
exports.userPurchaseList=(req,res)=>{
    Order.find({user:req.profile.id})
    .populate("user","id name")
    .exec ((err,oreder)=>{
        if(err){
            return res.status(400).json({
                error:"No oreder were placed by this user"
            })
        }
        return res.json(oreder)
    })
}
exports.pushOrderInPurchaseList = (req, res, next) => {
  let purchases = [];
  req.body.order.products.forEach(product => {
    purchases.push({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      amount: req.body.order.amount,
      transaction_id: req.body.order.transaction_id
    });
  });

  //store thi in DB
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { purchases: purchases } },
    { new: true },
    (err, purchases) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to save purchase list"
        });
      }
      next();
    }
  );
};