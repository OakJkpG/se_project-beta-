from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings

class PublicMediaStorage(S3Boto3Storage):
    location = 'covers'
    default_acl = 'public-read'
    file_overwrite = False
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME_MEDIA

class PrivateMediaStorage(S3Boto3Storage):
    location = 'pdfs'
    default_acl = 'private'
    file_overwrite = False
    custom_domain = False
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME_PDF
    querystring_expire = 30  # Signed URL หมดอายุใน 1 ชั่วโมง
