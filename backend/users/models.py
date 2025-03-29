from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import random
from django.db import transaction

class Profile(models.Model):
    USER_TYPES = [
        ('reader', 'Reader'),
        ('publisher', 'Publisher'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='reader')
    id_card = models.CharField(max_length=50, blank=True, null=True)
    verification_code = models.CharField(max_length=6, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_user_type_display()}"
    
    @staticmethod
    def generate_verification_code():
        """Generate a random 6-digit verification code"""
        return str(random.randint(100000, 999999))

    # Signal to create a profile when a user is created - with duplicate prevention
    @receiver(post_save, sender=User)
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            # Skip profile creation for users being registered through the publisher signup flow
            # This relies on a temporary attribute set during publisher signup
            if not hasattr(instance, '_skip_profile_creation'):
                # Use get_or_create to prevent duplicates
                Profile.objects.get_or_create(user=instance, defaults={'user_type': 'reader'})

    # Signal to save the profile when user is saved - with safety check
    @receiver(post_save, sender=User)
    def save_user_profile(sender, instance, **kwargs):
        # Check if user has a profile
        try:
            instance.profile.save()
        except User.profile.RelatedObjectDoesNotExist:
            # If no profile exists, create one
            Profile.objects.create(user=instance, user_type='reader')
