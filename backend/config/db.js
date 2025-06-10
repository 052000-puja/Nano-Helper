import mongoose from "mongoose"

const connectDb=async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB connected successfully")
    } catch(error) {
        console.error("DB connection failed:", error.message)
    }
}
export default connectDb