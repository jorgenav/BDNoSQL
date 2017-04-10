// 1. Listado de todas las publicaciones de un autor determinado. (El aggregate tarda mas)
db.practica.find(
    {
        "Authors.Nombre" : "Luca Cabibbo"
        },
    { "Title":1, "Authors.Nombre":1}

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
        "TotalPub": { $lt : 5 } // en nuestro caso $lt: 5
        }},
        {$count: "Authors"}
        ])        
// 5. Número de artículos de revista (article) y número de artículos en congresos 
//  (inproceedings) de los diez autores con más publicaciones totales.
//  Creando una tabla se hace mas rapido, sobretodo la segunda parte. (una vez que ya tienes la tabla)
// De la forma que lo ha hecho Jorge queda mas limpio, pero, se sacan separados los dos resultados. (Hablarlo)
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
// Nos da un valor diferente, porque Jorge calcula la media de las medias y este valor no es igual que
// la media total

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
// Jorge saca la lista de coautores de un autor, Jon, la lista de los coautores de todos lo autores
// Hablarlo porque igual el de Jon peta con muchos documentos        
        
// 8. Edad de los 5 autores con un periodo de publicaciones más largo (Se considera la Edad
// de un autor al número de años transcurridos desde la fecha de su primera publicación
// hasta la última registrada).
// No se lo que hace Jorge.... Hablarlo
        
        
// 9. Número de autores novatos, es decir, que tengan una Edad menor de 5 años (Se considera la edad de un
// autor al número de años transcurridos desde la fecha de su primera publicación hasta la última registrada).
// El de Jon tarda bastante mas y es mas sucio        
db.practica.aggregate([{$unwind:"$Authors"},
                   {$group:{_id:"$Authors.Nombre","first":{$last:"$Year"},"last":{$first:"$Year"}}},
                   {$project:{"Edad":{"$subtract":["$last","$first"]}}},
                   {$match:{"Edad":{$lt:5}}},
                   {$count:"Autores novatos"}])   
              
// 10. Porcentaje de publicaciones en revistas con respecto al total de publicaciones.
// Tardan lo mismo (hablarlo)                   
        