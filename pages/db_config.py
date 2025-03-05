from pymongo import MongoClient

MONGO_URI = "mongodb+srv://OakJkpG:WnbnpRFVlsvZ8xZG@cluster0.4q7uo.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["BookHub_DB"]
book_collection = db["test"]
