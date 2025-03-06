from pymongo import MongoClient

MONGO_URI = "mongodb+srv://OakJkpG:awZfdwaIMPNiHPNP@cluster0.aeia6.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["BookHub_DB"]
book_collection = db["books"]
user_collection = db["users"]