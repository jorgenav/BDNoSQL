
// Importacion de datos desde terminal
// mongoimport --db dblp --collection docs --type json --file result_total.json --jsonArray
// mongoimport --db dblp --collection docs --type json --file result_test.json --jsonArray

use dblp
show databases

db.docs.find().pretty()
// db.docs.drop()

show collections

db.docs.getIndexes() // Whatfor??


db.docs.aggregate([{$match:{'Year':{$gt:2011}}},
                    {$project:{'Title':1,'Year':1,'Authors':1,'Mdate':1,'Type':1}},
                    {$out:"practica"}])

db.practica.find().pretty()


// 1. Listado de todas las publicaciones de un autor determinado.
db.practica.aggregate([{$unwind:"$Authors"},
                   {$match:{"Authors.Nombre":"Luca Cabibbo"}},
                   {$group:{_id:"$Authors.Nombre","docsTitle":{$push:"$Title"}}}])



// 2. Número de publicaciones de un autor determinado.
db.practica.aggregate([{$unwind:"$Authors"},
                   {$match:{"Authors.Nombre":"Luca Cabibbo"}},
                   {$group:{_id:"$Authors.Nombre","docsTotal":{$sum:1}}},
                   {$project:{"docsTotal":1}}
                   ])
                   
// db.docs.aggregate([{$unwind:"$author"},
//                    {$match:{"author":"Oded Maimon"}},
//                    {$group:{_id:"$author","docsTitle":{$push:"$title"},"docsTotal":{$sum:1}}}])



// 3. Número de artículos en revista para el año 2016.
// db.practica.aggregate([{$match:{"Year":2016}},
//                    {$group:{_id:"$Year","docsTotal":{$sum:1},"docsType":{$push:"$doc_type"}}}])
                   
db.practica.aggregate([{$match:{"Year":2016,"Type":"article"}},
                   {$group:{_id:"$Year","docsTitle":{$push:"$Title"},"docsTotal":{$sum:1}}}
                   ])



// 4. Número de autores ocasionales, es decir, que tengan menos de 5 publicaciones en total.
db.practica.aggregate([{$unwind:"$Authors"},
                   {$group:{_id:"$Authors.Nombre","docsTotal":{$sum:1}}},
                   {$match:{"docsTotal":{$lt:5}}},
                   {$count:"docsTotal"}])
                   
// 5. Número de artículos de revista (article) y número de artículos en congresos (inproceedings) de los diez autores con más publicaciones totales.
db.practica.aggregate([{$unwind:"$Authors"},
                   {$match:{"Type":"article","Authors.Nombre":{$ne:null}}},
                   {$sortByCount:"$Authors.Nombre"},
                   {$limit:10}])
                   
db.practica.aggregate([{$unwind:"$Authors"},
                   {$match:{"Type":"inproceedings","Authors.Nombre":{$ne:null}}},
                   {$sortByCount:"$Authors.Nombre"},
                   {$limit:10}])
                                      
// Uso de group{} + sort{} en lugar de sortByCount{}. El resultado ha de ser el mismo
db.practica.aggregate([{$unwind:"$Authors"},
                   {$match:{"Type":"article","Authors.Nombre":{$ne:null}}},
                   {$group:{_id:"$Authors.Nombre","docsTotal":{$sum:1}}},
                   {$sort:{"docsTotal":-1}},
                   {$limit:10}])
                   
db.practica.aggregate([{$unwind:"$Authors"},
                   {$match:{"Type":"inproceedings","Authors.Nombre":{$ne:null}}},
                   {$group:{_id:"$Authors.Nombre","docsTotal":{$sum:1}}},
                   {$sort:{"docsTotal":-1}},
                   {$limit:10}])


// 6. Número medio de autores de todas las publicaciones que tenga en su conjunto de datos.
db.practica.aggregate([{$bucket:
                       {groupBy: "$Type",
                        boundaries: ["article","incollection","inproceedings"],
                        default: "inproceedings",
                        output:{"count": {$sum:1},
                                "autho": {$push: {$size:"$Authors"}}}}},
                    {$project:{"media":{$avg:"$autho"}}}])
                    
db.practica.aggregate([{$bucket:
                       {groupBy: "$Type",
                        boundaries: ["article","incollection","inproceedings"],
                        default: "inproceedings",
                        output:{"count": {$sum:1},
                                "autho": {$push: {$size:"$Authors"}}}}},
                    {$project:{"count":1, "media":{$avg:"$autho"}}},
                    {$group:{_id:1,"media":{$avg:"$media"}}}])



// 7. Listado de coautores de un autor (Se denomina coautor a cualquier persona que haya firmado una publicación).
db.practica.aggregate([{$match:{"Authors.Nombre":"Luca Cabibbo"}},
                   {$group:{_id: "$Authors.Nombre","coauthor":{$push: "$Authors.Nombre"}}},
                   {$unwind:"$_id"},
                   {$match:{"_id":"Luca Cabibbo"}},
                   {$unwind:"$coauthor"},
                   {$project: {"coauthor": {$setDifference: ["$coauthor",["Luca Cabibbo"]]}}},
                   {$unwind:"$coauthor"},
                   {$group: {_id:"$_id", "coauthor":{$push:"$coauthor"} }}])

// 8. Edad de los 5 autores con un periodo de publicaciones más largo (Se considera la Edad de un autor al
// número de años transcurridos desde la fecha de su primera publicación hasta la última registrada).
db.practica.aggregate([{$match:{"Year":{$gt:2013}}},
                   {$unwind:"$Authors"},
                   {$group:{_id:"$Authors.Nombre","first":{$last:"$Year"},"last":{$first:"$Year"}}},
                   {$project:{"_id":1,"Edad":{"$subtract":["$last","$first"]}}},
                   {$sort:{"Edad":-1}},
                   {$limit:5}])



// 9. Número de autores novatos, es decir, que tengan una Edad menor de 5 años (Se considera la edad de un
// autor al número de años transcurridos desde la fecha de su primera publicación hasta la última registrada).
db.practica.aggregate([{$match:{"Year":{$gt:2013}}},
                   {$unwind:"$Authors"},
                   {$group:{_id:"$Authors.Nombre","first":{$last:"$Year"},"last":{$first:"$Year"}}},
                   {$project:{"Edad":{"$subtract":["$last","$first"]}}},
                   {$match:{"Edad":{$lt:5}}},
                   {$count:"Autores novatos"}])



// 10. Porcentaje de publicaciones en revistas con respecto al total de publicaciones.
var total = db.practica.count()

db.practica.aggregate([{$group:{_id:"$Type","num":{$sum:1}}},
                   {$project:{_id:1,"porcentaje":{$multiply: [{$divide:["$num",total]},100]}}},
                   {$match:{"_id":"article"}}],
                   {$project:{"porcentaje":1}})







