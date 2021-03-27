const {MongoClient} = require('mongodb')
const { GoogleSpreadsheet } = require('google-spreadsheet')
let doc = new GoogleSpreadsheet('1jQZCnQ5c1gPCAbsHGfByiIgusQ2qTNSuprOmWACIc54')
require('dotenv').config()

const uri=process.env.DATABASE_URL
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
let db, cursor

let test=async()=>{
    let table='employment'
    let cmd='add'
    if(process.argv[2]) table=process.argv[2]
    if(process.argv[3]) cmd=process.argv[3]
    if(table!='employment')
        doc = new GoogleSpreadsheet('1YCuqvWiWK6ENuXnSFEZU1bpk1HDdWGqP0D_cCm8GSFk')
    console.log("Starting...")
    try {
    let identifiers=""
    //Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB")
    db = client.db(table==='employment'?'employment':'resources')
    cursor = db.collection(table+'Info').find({});
    //Create a string of identifiers, which are just every field for a job listing combined together.
    //Used to keep track of and remove duplicates.
    await cursor.forEach((el)=>{
        identifiers+="IDSTART"
        if(table==='employment')
            identifiers+=el.name+el.field+el.time+el.link+el.address+el.phone+el.exp+el.education+el.major
        else if(table==='housing')
            identifiers+=el.name+el.housing+el.phone+el.contact+el.address+el.city+el.zip+el.county+el.notes
        else if(table==='food')
            identifiers+=el.name+el.type+el.address+el.phone+el.city+el.zip+el.county+el.notes+el.site+el.timing
        else
            identifiers+=el.name+el.type+el.phone+el.other+el.address+el.city+el.zip+el.county+el.site+el.timing
        identifiers+="IDEND"
    })
    //Sign into and load Google Sheets info
    await doc.useServiceAccountAuth(require('./credential.json'))
    await doc.loadInfo()
    console.log("Connected to Google Sheets "+doc.title)
    let index=0
    if(table==='food') index=1
    if(table==='clothing') index=2
    const rows=await doc.sheetsByIndex[index].getRows()
    console.log(doc.sheetsByIndex[index].title)
    let toPush=[]
    if(cmd==='update'){
        console.log("Removing current entries")
        await db.collection(table+'Info').drop()
        identifiers=""
    }
    rows.forEach(async (el)=>{
        let id="IDSTART"+el.Name+el.Field+el.Commitment+el.Link+el.Address+el.Phone+el.Experience+el.Education+el.Major+"IDEND"
        if(table==='housing')
            id="IDSTART"+el.name+el.housing+el.phone+el.contact+el.address+el.city+el.zip+el.county+el.notes+"IDEND"
        else if(table==='food')
            id="IDSTART"+el.name+el.type+el.address+el.phone+el.city+el.zip+el.county+el.notes+el.site+el.timing+"IDEND"
        else if(table=='clothing')
            id="IDSTART"+el.name+el.type+el.phone+el.other+el.address+el.city+el.zip+el.county+el.site+el.timing+"IDEND"
        //Only push unique entries.
        if(!identifiers.includes(id)){
            //The structure of each object is stored in an array where the key is the name of the table.
            let newInfo=[]
            newInfo['employment']={
                name: el.Name,
                field: el.Field,
                time: el.Commitment,
                link: el.Link,
                address: el.Address,
                phone: el.Phone+"",
                exp: el.Experience,
                education: el.Education,
                major: el.Major
            }
            newInfo['housing']={
                name: el.name,
                housing: el.housing,
                phone: el.phone,
                contact: el.contact,
                address: el.address,
                city: el.city,
                zip: el.zip,
                county: el.county,
                notes: el.notes
            }
            newInfo['food']={
                name: el.name,
                type: el.type,
                address: el.address,
                phone: el.phone,
                city: el.city,
                zip: el.zip,
                county: el.county,
                notes: el.notes,
                site: el.site,
                timing: el.timing
            }
            newInfo['clothing']={
                name: el.name,
                type: el.type,
                phone: el.phone,
                other: el.other,
                address: el.address,
                city: el.city,
                zip: el.zip,
                county: el.county,
                site: el.site,
                timing: el.timing
            }
            //Only push unique entries.
            toPush.push(newInfo[table])
        }
    })
    if(toPush.length>0){
        await db.collection(table+'Info').insertMany(toPush)
        console.log("Added:\n")
        toPush.forEach(el=>{
            console.log(el)
        })
    } else
        console.log("Nothing new to add!")
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
};

test()