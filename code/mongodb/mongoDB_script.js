
// Importacion de datos desde terminal
// mongoimport --db dblp --collection docs --type json --file result_total.json --jsonArray
// mongoimport --db dblp --collection docs --type json --file result_test.json --jsonArray

use dblp
show databases

db.docs.find().pretty()
// db.docs.drop()

show collections

db.docs.getIndexes() // Whatfor??


// 1. Listado de todas las publicaciones de un autor determinado.
db.docs.aggregate([{$unwind:"$author"},
                   {$match:{"author":"Oded Maimon"}},
                   {$group:{_id:"$author","docsTitle":{$push:"$title"}}}])



// 2. Número de publicaciones de un autor determinado.
db.docs.aggregate([{$unwind:"$author"},
                   {$match:{"author":"Oded Maimon"}},
                   {$group:{_id:"$author","docsTotal":{$sum:1}}}])
                   
// db.docs.aggregate([{$unwind:"$author"},
//                    {$match:{"author":"Oded Maimon"}},
//                    {$group:{_id:"$author","docsTitle":{$push:"$title"},"docsTotal":{$sum:1}}}])



// 3. Número de artículos en revista para el año 2016.
db.docs.aggregate([{$match:{"year":2016}},
                   {$group:{_id:"$year","docsTotal":{$sum:1},"docsType":{$push:"$doc_type"}}}])
                   
db.docs.aggregate([{$match:{"year":2016,"doc_type":"article"}},
                   {$group:{_id:"$year","docsTitle":{$push:"$title"},"docsTotal":{$sum:1}}}])



// 4. Número de autores ocasionales, es decir, que tengan menos de 5 publicaciones en total.
db.docs.aggregate([{$unwind:"$author"},
                   {$group:{_id:"$author","docsTotal":{$sum:1}}},
                   {$match:{"docsTotal":{$lt:5}}}])

db.docs.aggregate([{$unwind:"$author"},
                   {$group:{_id:"$author","docsTotal":{$sum:1}}},
                   {$match:{"docsTotal":{$lt:5}}},
                   {$group:{_id:1,"author":{$push:"$_id"},"total":{$push:"$docsTotal"}}}])


db.runCommand(
   {aggregate:"docs",
    pipeline: [
                {$unwind:"$author"},
                {$group:{_id:"$author","docsTotal":{$sum:1}}},
                {$match:{"docsTotal":{$lt:5}}}
//                 {$limit:10}
              ],
    allowDiskUse: true
    }
)



// 5. Número de artículos de revista (article) y número de artículos en congresos (inproceedings) de los diez autores con más publicaciones totales.
db.docs.aggregate([{$unwind:"$author"},
                   {$match:{"doc_type":"article","author":{$ne:null}}},
                   {$sortByCount:"$author"},
                   {$limit:10}])
                   
db.docs.aggregate([{$unwind:"$author"},
                   {$match:{"doc_type":"inproceedings","author":{$ne:null}}},
                   {$sortByCount:"$author"},
                   {$limit:10}])
                   
db.docs.aggregate([{$unwind:"$author"},
                   {$match:{"doc_type":"incollection","author":{$ne:null}}},
                   {$sortByCount:"$author"},
                   {$limit:10}])

// Uso de group{} + sort{} en lugar de sortByCount{}. El resultado ha de ser el mismo
db.docs.aggregate([{$unwind:"$author"},
                   {$match:{"doc_type":"article","author":{$ne:null}}},
                   {$group:{_id:"$author","docsTotal":{$sum:1}}},
                   {$sort:{"docsTotal":-1}},
                   {$limit:10}])
                   
db.docs.aggregate([{$unwind:"$author"},
                   {$match:{"doc_type":"inproceedings","author":{$ne:null}}},
                   {$group:{_id:"$author","docsTotal":{$sum:1}}},
                   {$sort:{"docsTotal":-1}},
                   {$limit:10}])
                   
db.docs.aggregate([{$unwind:"$author"},
                   {$match:{"doc_type":"incollection","author":{$ne:null}}},
                   {$group:{_id:"$author","docsTotal":{$sum:1}}},
                   {$sort:{"docsTotal":-1}},
                   {$limit:10}])



// 6. Número medio de autores de todas las publicaciones que tenga en su conjunto de datos.
db.docs.aggregate([{$bucket:
                       {groupBy: "$doc_type",
                        boundaries: ["article","incollection","inproceedings"],
                        default: "inproceedings",
                        output:{"count": {$sum:1},
                                "autho": {$push: {$size:"$author"}}}}},
                    {$project:{"media":{$avg:"$autho"}}}])
                    
db.docs.aggregate([{$bucket:
                       {groupBy: "$doc_type",
                        boundaries: ["article","incollection","inproceedings"],
                        default: "inproceedings",
                        output:{"count": {$sum:1},
                                "autho": {$push: {$size:"$author"}}}}},
                    {$project:{"media":{$avg:"$autho"}}},
                    {$group:{_id:1,"media":{$avg:"$media"}}}])



// 7. Listado de coautores de un autor (Se denomina coautor a cualquier persona que haya firmado una publicación).
db.docs.aggregate([{$match:{"author":"Oded Maimon"}},
                   {$bucket:
                       {groupBy: "$author",
                        boundaries: [0,1],
                        default: "Oded Maimon",
                        output:{"coauthor": {$push: "$author"}}}},
                    {$unwind:"$coauthor"},
                    {$project: {"coauthor": {$setDifference: ["$coauthor",["Oded Maimon"]]}}},
                    {$unwind:"$coauthor"},
                    {$group: {_id:"$_id", "coauthor":{$push:"$coauthor"}}}])
                    
                    
db.docs.aggregate([{$match:{"author":"Oded Maimon"}},
                   {$group:{_id: "$author","coauthor":{$push: "$author"}}},
                   {$unwind:"$_id"},
                   {$match:{"_id":"Oded Maimon"}},
                   {$unwind:"$coauthor"},
                   {$project: {"coauthor": {$setDifference: ["$coauthor",["Oded Maimon"]]}}},
                   {$unwind:"$coauthor"},
                   {$group: {_id:"$_id", "coauthor":{$push:"$coauthor"} }}])



// 8. Edad de los 5 autores con un periodo de publicaciones más largo (Se considera la Edad de un autor al
// número de años transcurridos desde la fecha de su primera publicación hasta la última registrada).

db.docs.find({year: {$exists: true}}).forEach(function(obj) { 
    obj.year = new NumberInt(obj.year);
    db.docs.save(obj);
});


db.docs.aggregate([{$unwind:"$author"},
                   {$group:{_id:"$author","first":{$last:"$year"},"last":{$first:"$year"}}},
                   {$project:{"_id":1,"Edad":{"$subtract":["$last","$first"]}}},
                   {$sort:{"Edad":-1}},
                   {$limit:5}])



// 9. Número de autores novatos, es decir, que tengan una Edad menor de 5 años (Se considera la edad de un
// autor al número de años transcurridos desde la fecha de su primera publicación hasta la última registrada).
db.docs.aggregate([{$unwind:"$author"},
                   {$group:{_id:"$author","first":{$last:"$year"},"last":{$first:"$year"}}},
                   {$project:{"Edad":{"$subtract":["$last","$first"]}}},
                   {$match:{"Edad":{$lt:5}}},
                   {$count:"Autores novatos"}])



// 10. Porcentaje de publicaciones en revistas con respecto al total de publicaciones.
var total = db.docs.count()

db.docs.aggregate([{$group:{_id:"$doc_type","num":{$sum:1}}},
                   {$project:{_id:1,"porcentaje":{$multiply: [{$divide:["$num",total]},100]}}},
                   {$match:{"_id":"article"}}])







