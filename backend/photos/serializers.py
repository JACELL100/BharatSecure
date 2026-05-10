from rest_framework import serializers
from .models import Photo

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ['id', 'title', 'image', 'uploaded_at']
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            # Handle both Supabase URLs (strings) and Django FileField objects
            if isinstance(instance.image, str):
                data['image'] = instance.image
            else:
                data['image'] = f"http://127.0.0.1:8000{instance.image.url}"
        return data