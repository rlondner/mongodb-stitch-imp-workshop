exports = function(start, end) {
    var atlas = context.services.get('mongodb-atlas');
    var coll = atlas.db('Data').collection('Climate');

    return coll.find({ "Timestamp": {"$gt": start, "$lt": end }},
        {"_id": 0,"Timestamp": 1, "indoorTemp": 1})
        .sort({"Timestamp": 1})
        .limit(100)
        .toArray();
};