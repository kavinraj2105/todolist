//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose =require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser: true});

const itemsSchema ={
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to the TodoList"
});

const item2 =new Item({
  name : "Press + to add to the list"
});

const item3 = new Item({
  name:" Press -- to delete an item"
});

const defaultItems = [item1, item2, item3];



const listSchema = {
  name : String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {


  Item.find({},function(err,foundItems){

    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.logg(err);
        }
        else
        {
          console.log("Success");
        }
      });

      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }



  });


});


app.get("/:customListName",function(req,res){
  const customlistname = _.capitalize(req.params.customListName);

   List.findOne({name:customlistname},function(err,foundlist){
     if(!err)
     {
       if(!foundlist)
       {
         //create anew list
         const list = new List({
           name: customlistname,
           items: defaultItems
         });

         list.save();
         res.redirect("/"+ customlistname);

       }
       else{
         //show lists
         res.render("list",{listTitle:foundlist.name, newListItems: foundlist.items});
       }
     }
   });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname = req.body.list;


  const item = new Item({
    name:itemName
  });

  if(listname ==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    })
  }



});


app.post("/delete",function(req,res)
{
  const checkitemid = req.body.checkboxs;
  const listname = req.body.listname;
if(listname === "Today")
{
  Item.findByIdAndRemove(checkitemid,function(err){
    if(!err)
    {
      console.log("Success");
      res.redirect("/");
    }
  });
}
else{
  List.findOneAndUpdate({name: listname},{$pull: {items: {_id:checkitemid}}},function(err,foundlist){
    if(!err)
    {
      res.redirect("/"+listname);
    }
  })
}


});





app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
