from rest_framework import serializers
from .models import PotholeAnalysis, PotholeVideoAnalysis, VideoFrameDetection

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
        # obj.image is already a full URL from Supabase
        if obj.image:
            return obj.image if isinstance(obj.image, str) else obj.image.url
        return None
    
    def get_processed_image_url(self, obj):
        # obj.processed_image is already a full URL from Supabase
        if obj.processed_image:
            return obj.processed_image if isinstance(obj.processed_image, str) else obj.processed_image.url
        return None


class VideoFrameDetectionSerializer(serializers.ModelSerializer):
    frame_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoFrameDetection
        fields = '__all__'
        read_only_fields = ['video_analysis', 'created_at']
    
    def get_frame_image_url(self, obj):
        # obj.frame_image is already a full URL from Supabase
        if obj.frame_image:
            return obj.frame_image if isinstance(obj.frame_image, str) else obj.frame_image.url
        return None


class PotholeVideoAnalysisSerializer(serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField()
    processed_video_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    frame_detections = VideoFrameDetectionSerializer(many=True, read_only=True)
    detection_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PotholeVideoAnalysis
        fields = '__all__'
        read_only_fields = [
            'status', 'processing_progress', 'error_message',
            'duration_seconds', 'fps', 'total_frames', 'frames_analyzed',
            'total_potholes_detected', 'average_severity', 'max_severity',
            'average_area_cm2', 'average_depth_cm', 'total_estimated_cost',
            'timestamp_data', 'analyzed_at', 'processed_video', 'thumbnail'
        ]
    
    def get_video_url(self, obj):
        # obj.video is already a full URL from Supabase
        if obj.video:
            return obj.video if isinstance(obj.video, str) else obj.video.url
        return None
    
    def get_processed_video_url(self, obj):
        # obj.processed_video is already a full URL from Supabase
        if obj.processed_video:
            return obj.processed_video if isinstance(obj.processed_video, str) else obj.processed_video.url
        return None
    
    def get_thumbnail_url(self, obj):
        # obj.thumbnail is already a full URL from Supabase
        if obj.thumbnail:
            return obj.thumbnail if isinstance(obj.thumbnail, str) else obj.thumbnail.url
        return None
    
    def get_detection_count(self, obj):
        return obj.frame_detections.count()


class PotholeVideoAnalysisListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views"""
    video_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PotholeVideoAnalysis
        fields = [
            'id', 'video_url', 'thumbnail_url', 'status', 'processing_progress',
            'duration_seconds', 'total_potholes_detected', 'average_severity',
            'max_severity', 'route_name', 'location', 'created_at', 'analyzed_at'
        ]
    
    def get_video_url(self, obj):
        # obj.video is already a full URL from Supabase
        if obj.video:
            return obj.video if isinstance(obj.video, str) else obj.video.url
        return None
    
    def get_thumbnail_url(self, obj):
        # obj.thumbnail is already a full URL from Supabase
        if obj.thumbnail:
            return obj.thumbnail if isinstance(obj.thumbnail, str) else obj.thumbnail.url
        return None