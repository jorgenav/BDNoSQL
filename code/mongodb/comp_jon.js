// 1. Listado de todas las publicaciones de un autor determinado. (El aggregate tarda mas)
db.practica.find(
    {
        "Authors.Nombre" : "Luca Cabibbo"
        },
    {"_id":0, "Title":1}

)


// 2. Número de publicaciones de un autor determinado.(El aggregate tarda mas)
db.practica.find(
    {
        "Authors.Nombre" : "Luca Cabibbo"
        }
).count()
        
// 3. Número de artículos en revista para el año 2016.(El aggregate tarda mas)

db.practica.find(
    {
        "Year" : 2014,
        "Type" : "article"
        }
).count()    
      
// 4. Número de autores ocasionales, es decir, que tengan menos de 5 publicaciones en total.
//         (Lo tenemos igual)
        
db.practica.aggregate([
        {$unwind:"$Authors"},
        { $group : {
            _id : "$Authors.Nombre",
            "TotalPub":{$sum:1}
        }},
        {$match: {
        "TotalPub": { $lt : 5 }
        }},
        {$count: "Authors"}
        ])        
// 5. Número de artículos de revista (article) y número de artículos en congresos 
//  (inproceedings) de los diez autores con más publicaciones totales.
// Problemas al ejecutar group por memoria -> Se filtra para obtener unicamente años 2015 y 2016
db.practica.aggregate([
        {$match:{"Year":{$gt:2015}}},
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
            $or:[{"Tipos":"article"},{"Tipos":"incollection"}]}}, 
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

//  6. Número medio de autores de todas las publicaciones que tenga en su conjunto de datos.

db.practica.aggregate([
        {$group:{
            "_id":null,
            "TotalAut":{$sum:{$size:"$Authors"}},
            "TotalPublic":{$sum:1}
            }},
        {$project:{"TotalAut":1,"TotalPublic":1,"Promedio":{$divide:["$TotalAut","$TotalPublic"]}}}
        
        ])

// 7. Listado de coautores de un autor (Se denomina coautor a cualquier persona que haya
// firmado una publicación).
// Listado de coautores para UN SOLO autor
db.practica.aggregate([{$match:{"Authors.Nombre":"Luca Cabibbo"}},
                   {$group:{_id: "$Authors.Nombre","coauthor":{$push: "$Authors.Nombre"}}},
                   {$unwind:"$_id"},
                   {$match:{"_id":"Luca Cabibbo"}},
                   {$unwind:"$coauthor"},
                   {$project: {"coauthor": {$setDifference: ["$coauthor",["Luca Cabibbo"]]}}},
                   {$unwind:"$coauthor"},
                   {$group: {_id:"$_id", "coauthor":{$push:"$coauthor"} }}])

// Listado de coautores POR CADA autor
db.practica.aggregate([
        {$match:{"Year":{$eq:2012}}},
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
        
        
// En caso de querer mostrar los coautores PARA CADA autor, mongodb falla por exceder limites de memoria -> Mejor Neo4j??

        
// 8. Edad de los 5 autores con un periodo de publicaciones más largo (Se considera la Edad
// de un autor al número de años transcurridos desde la fecha de su primera publicación
// hasta la última registrada).
db.practica.aggregate([{$match:{"Year":{$gt:2013}}},
                   {$unwind:"$Authors"},
                   {$group:{_id:"$Authors.Nombre","first":{$last:"$Year"},"last":{$first:"$Year"}}},
                   {$project:{"_id":1,"Edad":{"$subtract":["$last","$first"]}}},
                   {$sort:{"Edad":-1}},
                   {$limit:5}])
// Filtrado de años para evitar errores de memoria -> Neo4j mejor??

        
// 9. Número de autores novatos, es decir, que tengan una Edad menor de 5 años (Se considera la edad de un
// autor al número de años transcurridos desde la fecha de su primera publicación hasta la última registrada).
db.practica.aggregate([{$match:{"Year":{$gt:2013}}},
                   {$unwind:"$Authors"},
                   {$group:{_id:"$Authors.Nombre","first":{$last:"$Year"},"last":{$first:"$Year"}}},
                   {$project:{"Edad":{"$subtract":["$last","$first"]}}},
                   {$match:{"Edad":{$lt:5}}},
                   {$count:"Autores novatos"}])
              
// 10. Porcentaje de publicaciones en revistas con respecto al total de publicaciones.
db.practica.aggregate([
            {$group:{
                "_id":"article",
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