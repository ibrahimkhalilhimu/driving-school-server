const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs-extra')
const fileUpload = require('express-fileupload'); 
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.huwqv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('courses'))
app.use(fileUpload())

const port = 5000
app.get('/', (req, res) => {
  res.send('Hello World!')
})





const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const CoursesCollection = client.db("drivingSchool").collection("courses");
  const orderCollection = client.db("drivingSchool").collection("order");
  const reviewCollection = client.db("drivingSchool").collection("review");
  const adminCollection = client.db("drivingSchool").collection("admin");

  app.post('/addCourses',(req,res)=>{
    const newCourse = req.body
    CoursesCollection.insertOne(newCourse)
    .then(result=>{
      res.send(result.insertedCount>0)
      console.log(result);
    })
  })


  app.get('/courses',(req,res) => {
    CoursesCollection.find({})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })


  app.post('/addOrder',(req,res)=>{
    const orders = req.body;
    orderCollection.insertOne(orders)
    .then(result=>{
      res.send(result.insertedCount>0)
    })
  })


  app.get('/orders',(req,res)=>{
    orderCollection.find({email: req.query.email})
    .toArray((err,documents)=>{
      res.send(documents)
    })
  })

  app.post('/addReview',(req,res)=>{
    const review = req.body;
    console.log(review);
    reviewCollection.insertOne(review)
    .then(result=>{
      res.send(result.insertedCount>0)
    })
  })

  app.get('/review', (req, res) => {
    reviewCollection.find({})
    .toArray( (err, documents) => {
        res.send(documents);
    })
  })

  app.post('/makeAdmin',(req, res)=>{
    const admin = req.body;
    console.log(admin);
    adminCollection.insertOne(admin)
    .then((result)=>{
      console.log(result.insertCount > 0);
      res.send(result.insertCount > 0);
    })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email
    adminCollection.find({email:email})
    .toArray( (err, admin) => {
        res.send(admin.length>0);
    })
  })

  app.get('/order', (req, res) => {
    orderCollection.find({})
    .toArray( (err, documents) => {
        res.send(documents);
    })
  })

  app.delete('/deleteOrder/:id',(req,res)=>{
    orderCollection.deleteOne({_id:ObjectId(req.params.id)})
    .then((result)=>{
      console.log(result.deletedCount > 0);
       res.send(result.deletedCount > 0);
    })
    
  })

  app.delete('/deleteCourse/:id',(req,res)=>{
    CoursesCollection.deleteOne({_id:ObjectId(req.params.id)})
    .then((result)=>{
      console.log(result.deletedCount > 0);
       res.send(result.deletedCount > 0);
    })
    
  })


  app.patch('/update/:id',(req,res)=>{
    const { title, price, description, img } = req.body
    CoursesCollection.updateOne(
      {_id: ObjectId(req.params.id)
      },
    {
      $set: {title,description,price,img}
    }
    )
    .then(result=>{
      console.log(result);
      res.send(result.modifiedCount >0)
    })
  })


  app.patch('/statusUpdate/:id', (req, res) => {
    console.log(req.body);
    console.log(req.params.id);
    orderCollection.updateOne(
      { _id: ObjectId(req.params.id) },
      {
        $set: { OrderStatus
          :req.body.status }
      }
    )
      .then(result => {
        console.log(result);
        res.send(result.modifiedCount > 0)
      })
      .catch(err => console.log(err))


  })




});



app.listen(process.env.PORT || port)


