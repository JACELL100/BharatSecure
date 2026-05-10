from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.core.files.base import ContentFile
from .models import PotholeAnalysis, PotholeVideoAnalysis, VideoFrameDetection
from .serializers import (
    PotholeAnalysisSerializer, 
    PotholeVideoAnalysisSerializer,
    PotholeVideoAnalysisListSerializer,
    VideoFrameDetectionSerializer
)
from .cv_service import PotholeAnalyzer, PotholeVideoAnalyzer
from utils.supabase_storage import get_storage
import os
import shutil
import tempfile
from threading import Thread

class PotholeAnalysisViewSet(viewsets.ModelViewSet):
    queryset = PotholeAnalysis.objects.all()
    serializer_class = PotholeAnalysisSerializer
    
    def create(self, request, *args, **kwargs):
        """Upload image and automatically analyze"""
        image_file = request.FILES.get('image')
        if not image_file:
            return Response(
                {'error': 'No image file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Upload to Supabase
            storage = get_storage()
            image_url = storage.upload_file(
                file=image_file,
                bucket_name='potholes',
                folder='original'
            )
            
            # Create instance with URL
            data = request.data.copy()
            data['image'] = image_url
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            
            # Download image temporarily for analysis
            temp_dir = tempfile.mkdtemp()
            temp_image_path = os.path.join(temp_dir, 'temp_image.jpg')
            
            # Download from URL for processing
            import requests
            response = requests.get(image_url)
            with open(temp_image_path, 'wb') as f:
                f.write(response.content)
            
            # Analyze the image
            try:
                self._analyze_pothole(instance, temp_image_path)
                instance.refresh_from_db()
            except Exception as e:
                return Response(
                    {'error': f'Analysis failed: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            finally:
                # Cleanup temp files
                shutil.rmtree(temp_dir, ignore_errors=True)
            
            return Response(
                self.get_serializer(instance).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {'error': f'Upload failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def reanalyze(self, request, pk=None):
        """Reanalyze an existing image"""
        instance = self.get_object()
        
        # Download image temporarily for analysis
        temp_dir = tempfile.mkdtemp()
        temp_image_path = os.path.join(temp_dir, 'temp_image.jpg')
        
        try:
            # Download from URL
            import requests
            response = requests.get(instance.image)
            with open(temp_image_path, 'wb') as f:
                f.write(response.content)
            
            self._analyze_pothole(instance, temp_image_path)
            instance.refresh_from_db()
            return Response(self.get_serializer(instance).data)
        except Exception as e:
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)
    
    def _analyze_pothole(self, instance, image_path):
        """Internal method to perform analysis"""
        analyzer = PotholeAnalyzer()
        
        # Analyze
        results = analyzer.analyze_image(image_path)
        
        if results is None:
            raise ValueError("No pothole detected in image")
        
        # Update instance with results
        instance.width_cm = results['width_cm']
        instance.height_cm = results['height_cm']
        instance.area_cm2 = results['area_cm2']
        instance.perimeter_cm = results['perimeter_cm']
        instance.depth_estimate = results['depth_estimate']
        instance.severity = results['severity']
        instance.confidence_score = results['confidence_score']
        instance.impact_score = results['impact_score']
        instance.repair_priority = results['repair_priority']
        instance.estimated_repair_cost = results['estimated_repair_cost']
        instance.analyzed_at = timezone.now()
        
        # Upload processed image to Supabase
        if results.get('processed_image'):
            storage = get_storage()
            processed_url = storage.upload_file(
                file=results['processed_image'],
                bucket_name='processed-images',
                folder='potholes',
                filename=f'processed_{instance.id}.jpg'
            )
            instance.processed_image = processed_url
        
        instance.save()


class PotholeVideoAnalysisViewSet(viewsets.ModelViewSet):
    queryset = PotholeVideoAnalysis.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PotholeVideoAnalysisListSerializer
        return PotholeVideoAnalysisSerializer
    
    def create(self, request, *args, **kwargs):
        """Upload video and start analysis"""
        video_file = request.FILES.get('video')
        if not video_file:
            return Response(
                {'error': 'No video file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Upload to Supabase
            storage = get_storage()
            video_url = storage.upload_file(
                file=video_file,
                bucket_name='pothole-videos',
                folder='original'
            )
            
            # Create instance with URL
            data = request.data.copy()
            data['video'] = video_url
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save(status='pending')
            
            # Start analysis in background thread
            thread = Thread(target=self._analyze_video_async, args=(instance.id,))
            thread.daemon = True
            thread.start()
            
            return Response(
                self.get_serializer(instance).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {'error': f'Upload failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def reanalyze(self, request, pk=None):
        """Reanalyze an existing video"""
        instance = self.get_object()
        
        if instance.status == 'processing':
            return Response(
                {'error': 'Video is already being processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Clear old results
        instance.frame_detections.all().delete()
        instance.status = 'pending'
        instance.processing_progress = 0
        instance.error_message = None
        instance.save()
        
        # Start analysis in background thread
        thread = Thread(target=self._analyze_video_async, args=(instance.id,))
        thread.daemon = True
        thread.start()
        
        return Response(self.get_serializer(instance).data)
    
    @action(detail=True, methods=['get'])
    def detections(self, request, pk=None):
        """Get all frame detections for a video"""
        instance = self.get_object()
        detections = instance.frame_detections.all()
        serializer = VideoFrameDetectionSerializer(
            detections, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """Get detection timeline data"""
        instance = self.get_object()
        return Response({
            'video_id': instance.id,
            'duration': instance.duration_seconds,
            'timeline_data': instance.timestamp_data or [],
            'total_detections': instance.total_potholes_detected
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get overall statistics across all videos"""
        videos = self.get_queryset().filter(status='completed')
        
        total_videos = videos.count()
        total_potholes = sum(v.total_potholes_detected for v in videos)
        total_cost = sum(v.total_estimated_cost or 0 for v in videos)
        
        severity_counts = {
            'low': 0,
            'medium': 0,
            'high': 0,
            'critical': 0
        }
        
        for video in videos:
            if video.max_severity:
                severity_counts[video.max_severity] = severity_counts.get(video.max_severity, 0) + 1
        
        return Response({
            'total_videos_analyzed': total_videos,
            'total_potholes_detected': total_potholes,
            'total_estimated_cost': round(total_cost, 2),
            'average_potholes_per_video': round(total_potholes / total_videos, 2) if total_videos > 0 else 0,
            'severity_distribution': severity_counts
        })
    
    def _analyze_video_async(self, video_id):
        """Background task to analyze video"""
        temp_dir = None
        try:
            instance = PotholeVideoAnalysis.objects.get(id=video_id)
            instance.status = 'processing'
            instance.processing_progress = 0
            instance.save()
            
            # Download video temporarily for analysis
            temp_dir = tempfile.mkdtemp()
            temp_video_path = os.path.join(temp_dir, 'temp_video.mp4')
            
            import requests
            response = requests.get(instance.video, stream=True)
            with open(temp_video_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Progress callback
            def update_progress(progress):
                instance.processing_progress = progress
                instance.save(update_fields=['processing_progress'])
            
            # Analyze video
            analyzer = PotholeVideoAnalyzer(frame_skip=5)
            results = analyzer.analyze_video(temp_video_path, progress_callback=update_progress)
            
            storage = get_storage()
            
            # Update video metadata
            metadata = results['video_metadata']
            instance.duration_seconds = metadata['duration_seconds']
            instance.fps = metadata['fps']
            instance.total_frames = metadata['total_frames']
            instance.frames_analyzed = metadata['frames_analyzed']
            
            # Update aggregate stats
            stats = results['aggregate_stats']
            instance.total_potholes_detected = stats['total_potholes']
            instance.average_severity = stats['average_severity']
            instance.max_severity = stats['max_severity']
            instance.average_area_cm2 = stats['average_area_cm2']
            instance.average_depth_cm = stats['average_depth_cm']
            instance.total_estimated_cost = stats['total_estimated_cost']
            instance.timestamp_data = stats['timestamp_data']
            
            # Upload processed video
            if os.path.exists(results['processed_video_path']):
                processed_video_url = storage.upload_file(
                    file=results['processed_video_path'],
                    bucket_name='processed-videos',
                    folder='potholes',
                    filename=f'processed_video_{instance.id}.mp4'
                )
                instance.processed_video = processed_video_url
            
            # Upload thumbnail
            if results['thumbnail_path'] and os.path.exists(results['thumbnail_path']):
                thumbnail_url = storage.upload_file(
                    file=results['thumbnail_path'],
                    bucket_name='video-thumbnails',
                    folder='potholes',
                    filename=f'thumbnail_{instance.id}.jpg'
                )
                instance.thumbnail = thumbnail_url
            
            # Save frame detections
            for detection in results['detections']:
                frame_image_url = None
                if detection['frame_path'] and os.path.exists(detection['frame_path']):
                    frame_image_url = storage.upload_file(
                        file=detection['frame_path'],
                        bucket_name='video-frames',
                        folder='potholes',
                        filename=f'frame_{instance.id}_{detection["frame_number"]}.jpg'
                    )
                
                VideoFrameDetection.objects.create(
                    video_analysis=instance,
                    frame_number=detection['frame_number'],
                    timestamp_seconds=detection['timestamp_seconds'],
                    frame_image=frame_image_url,
                    width_cm=detection['width_cm'],
                    height_cm=detection['height_cm'],
                    area_cm2=detection['area_cm2'],
                    depth_estimate=detection['depth_estimate'],
                    perimeter_cm=detection['perimeter_cm'],
                    severity=detection['severity'],
                    confidence_score=detection['confidence_score'],
                    impact_score=detection['impact_score'],
                    bbox_x=detection['bounding_box'][0],
                    bbox_y=detection['bounding_box'][1],
                    bbox_width=detection['bounding_box'][2],
                    bbox_height=detection['bounding_box'][3]
                )
            
            # Clean up temp directory
            if 'temp_dir' in results and os.path.exists(results['temp_dir']):
                shutil.rmtree(results['temp_dir'], ignore_errors=True)
            
            # Mark as completed
            instance.status = 'completed'
            instance.processing_progress = 100
            instance.analyzed_at = timezone.now()
            instance.save()
            
        except Exception as e:
            # Handle errors
            try:
                instance = PotholeVideoAnalysis.objects.get(id=video_id)
                instance.status = 'failed'
                instance.error_message = str(e)
                instance.save()
            except:
                pass
        finally:
            # Cleanup temp files
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)