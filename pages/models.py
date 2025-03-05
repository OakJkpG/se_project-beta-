from djongo import models

class Book(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image_url = models.URLField()


