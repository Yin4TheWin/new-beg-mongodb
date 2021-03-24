const {MongoClient} = require('mongodb')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const doc = new GoogleSpreadsheet('1jQZCnQ5c1gPCAbsHGfByiIgusQ2qTNSuprOmWACIc54')
require('dotenv').config()

const uri=process.env.DATABASE_URL
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
let db, cursor

let test=async()=>{
    try {
    let identifiers=""
    await client.connect();
    db = client.db("employment")
    cursor = db.collection('jobInfo').find({});
    await cursor.forEach((info)=>{
        identifiers+="IDSTART"+info.name+info.field+info.time+info.link+info.address+info.phone+info.exp+info.education+info.major+"IDEND"
    })
    console.log(identifiers[0])
    await doc.useServiceAccountAuth(require('./credential.json'))
    await doc.loadInfo()
    const rows=await doc.sheetsByIndex[0].getRows()
    let toPush=[]
    rows.forEach(async (el)=>{
        //Name Field Commitment Link Address Phone Experience Education Major
        if(el.Name==null) el.Name="None listed"
        if(el.Field==null) el.Field="None listed"
        if(el.Commitment==null) el.Commitment="None listed"
        if(el.Link==null) el.Link="None listed"
        if(el.Address==null) el.Address="None listed"
        if(el.Phone==null) el.Phone="None listed"
        if(el.Experience==null) el.Experience="None listed"
        if(el.Education==null) el.Education="None listed"
        if(el.Major==null) el.Major="None listed"
        let id="IDSTART"+el.Name+el.Field+el.Commitment+el.Link+el.Address+el.Phone+el.Experience+el.Education+el.Major+"IDEND"
        if(!identifiers.includes(id)){
            //name field time link address phone exp education major
            toPush.push({
                name: el.Name,
                field: el.Field,
                time: el.Commitment,
                link: el.Link,
                address: el.Address,
                phone: el.Phone+"",
                exp: el.Experience,
                education: el.Education,
                major: el.Major
            })
        }
    })
    console.log(doc.title)
    toPush.forEach(el=>{
        console.log(el)
    })
    await db.collection('jobInfo').insertMany(toPush)
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
};

test()
