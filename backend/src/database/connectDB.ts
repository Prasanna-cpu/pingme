import mongoose from "mongoose"

export const connectDB = async (uri : string) => {
    try{
        const connection = await mongoose.connect(uri, {
            dbName : "pingmedb"
        })
        console.log(`Connected to database : ${connection?.connection?.db?.databaseName}`)
    }
    catch(e){
        console.error("Error in connection : " + (e as Error).message)
    }
}