# pothole_analyzer/serializers.py
from rest_framework import serializers
from .models import PotholeAnalysis

class PotholeAnalysisSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    processed_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PotholeAnalysis
        fields = '__all__'
        read_only_fields = [
            'width_cm', 'height_cm', 'area_cm2', 'depth_estimate',
            'perimeter_cm', 'severity', 'confidence_score', 'impact_score',
            'repair_priority', 'estimated_repair_cost', 'analyzed_at', 'processed_image'
        ]
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
    
    def get_processed_image_url(self, obj):
        request = self.context.get('request')
        if obj.processed_image and request:
            return request.build_absolute_uri(obj.processed_image.url)
        return None