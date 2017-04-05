db.practica.find()

// Listado de todas las publicaciones de un autor determinado.

db.practica.find(
    {
        "Authors.Nombre" : "Luca Cabibbo"
        },
    { "Title":1, "Authors.Nombre":1}

)
 
//  Número de publicaciones de un autor determinado.

db.practica.find(
    {
        "Authors.Nombre" : "Luca Cabibbo"
        }
).count()
        
//  Número de artículos en revista para el año 2016.

db.practica.find(
    {
        "Year" : 2014,
        "Type" : "article"
        }
).count()
        
// Número de autores ocasionales, es decir, que tengan menos de 5 publicaciones en total.
db.practica.aggregate([
        {$unwind:"$Authors"},
        { $group : {
            _id : "$Authors.Nombre",
            "TotalPub":{$sum:1}
        }},
        {$match: {
        "TotalPub": { $lt : 5 } // en nuestro caso $lt: 5
        }},
        {$count: "Authors"}
        ])
        
//  Número de artículos de revista (article) y número de artículos en congresos 
//  (inproceedings) de los diez autores con más publicaciones totales.

db.practica.find()
db.practica.aggregate([
        {$unwind:"$Authors"},
        { $group : {
            _id : "$Authors.Nombre",
            "TotalPub":{$sum:1},
            "Tipos":{$push:"$Type"}
        }},
        {$sort: {"TotalPub":-1}},
        {$limit:10},
        {$project:{"TotalPub":1,"Tipos":1}},
        {$out:"tiposPub"}
        ])
        
        
db.tiposPub.aggregate([
        {$unwind:"$Tipos"},
        {$match:{ 
            $or:[{"Tipos":"article"},{"Tipos":"incollection"}]}}, // http://stackoverflow.com/questions/16902930/mongodb-aggregation-framework-match-or
        {$group:{
       "_id":"$_id",
            "TotalArticles":{
                $sum:{
                    $cond:[ {$eq: ["$Tipos","article"]},1,0]
                }
            },
            "TotalIcollection":{
                $sum:{
                    $cond:[ {$eq: ["$Tipos","incollection"]},1,0]
                }
            }            
        }
        },          
        {$sort:{"TotalArticles":-1}}  
        ])


db.tiposPub.find()


//  Número medio de autores de todas las publicaciones que tenga en su conjunto de datos.

db.practica.aggregate([
        {$group:{
            "_id":null,
            "TotalAut":{$sum:{$size:"$Authors"}},
            "TotalPublic":{$sum:1}
            }},
        {$project:{"TotalAut":1,"TotalPublic":1,"Promedio":{$divide:["$TotalAut","$TotalPublic"]}}}
        
        ])
        
//  Listado de coautores de un autor (Se denomina coautor a cualquier persona que haya
// firmado una publicación).

db.practica.aggregate([
        {$unwind:"$Authors"},
        {$group:{
            "_id":"$Authors.Nombre",
            "Publications":{$push:"$_id"}
            }},
        {$sort:{"_id":1}},
        {$out:"AutPub"}
        ])


db.AutPub.find()
        
db.practica.aggregate([
        {$unwind:"$Authors"},
        {$lookup:{
            from:"AutPub",
            localField:"_id",
            foreignField:"Publications",
            as: "autores"
            }},
        {$project:{
            "Nombre":"$Authors.Nombre",
            "_id":"$Nombre",
            "autores._id":1
            }},
        {$limit:20},
        {$group:{
            "_id":"$Nombre",
            "Coautores":{$push:"$autores"},
            }},
        {$unwind:"$Coautores"},
        {$unwind:"$Coautores"},
        {$group:{
            "_id":"$_id",
            "listaCoautores":{$addToSet:"$Coautores"}
            }},
        {$out:"Coautores"}
        ])  
db.Coautores.update({},{$pull:{"listaCoautores":{"_id":"$_id"}}}, {multi:true})
db.Coautores.find()
            
      
//  Edad de los 5 autores con un periodo de publicaciones más largo (Se considera la Edad
// de un autor al número de años transcurridos desde la fecha de su primera publicación
// hasta la última registrada).
        
db.publications.find()
    
db.practica.aggregate([
        {$unwind: "$Authors"},
        {$group:{
            "_id": "$Authors.Nombre",
            "PubYear":{$push:"$Year"}
            }},
        {$sort: {"PubYear":-1}},
        {$unwind: "$PubYear"},
        {$group:{
            "_id": "$_id",
            "OldPub":{$last:"$PubYear"},
            "NewPub":{$first:"$PubYear"},
            }},
        {$project:{
            "_id":0,
            "OldPub":1,
            "NewPub":1,
            "DifYear":{"$subtract":["$NewPub","$OldPub"]}
            }},
        {$sort:{"DifYear":-1}},
        {$limit:5}
        ])
        
//  Número de autores novatos, es decir, que tengan una Edad menor de 5 años (Se
// considera la edad de un autor al número de años transcurridos desde la fecha de su
// primera publicación hasta la última registrada).


db.practica.aggregate([
        {$unwind: "$Authors"},
        {$group:{
            "_id": "$Authors.Nombre",
            "PubYear":{$push:"$Year"}
            }},
        {$sort: {"PubYear":-1}},
        {$unwind: "$PubYear"},
        {$group:{
            "_id": "$_id",
            "OldPub":{$last:"$PubYear"},
            "NewPub":{$first:"$PubYear"},
            }},
        {$project:{
            "_id":0,
            "OldPub":1,
            "NewPub":1,
            "DifYear":{"$subtract":["$NewPub","$OldPub"]}
            }},
        {$sort:{"DifYear":-1}},
        {$match:{"DifYear":{$lt:6}}},
        {$count:"Authors"}
        ])
        
//  Porcentaje de publicaciones en revistas con respecto al total de publicaciones.


db.practica.aggregate([
            {$group:{
                "_id":null,
           "TotalArticles":{
                $sum:{
                    $cond:[ {$eq: ["$Type","article"]},1,0]
                }
            },
                 "TotPub":{$sum:1}
                        }},
            {$project:{
                "TotPub":1,
                "TotalArticles":1,
                "Porportion":{$multiply:[{$divide:["$TotalArticles","$TotPub"]},100]}}}
            
            ])      
