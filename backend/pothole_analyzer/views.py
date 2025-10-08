# pothole_analyzer/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import PotholeAnalysis
from .serializers import PotholeAnalysisSerializer
from .cv_service import PotholeAnalyzer
import os

class PotholeAnalysisViewSet(viewsets.ModelViewSet):
    queryset = PotholeAnalysis.objects.all()
    serializer_class = PotholeAnalysisSerializer
    
    def create(self, request, *args, **kwargs):
        """Upload image and automatically analyze"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        
        # Analyze the image
        try:
            self._analyze_pothole(instance)
            instance.refresh_from_db()
        except Exception as e:
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def reanalyze(self, request, pk=None):
        """Reanalyze an existing image"""
        instance = self.get_object()
        
        try:
            self._analyze_pothole(instance)
            instance.refresh_from_db()
            return Response(self.get_serializer(instance).data)
        except Exception as e:
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _analyze_pothole(self, instance):
        """Internal method to perform analysis"""
        analyzer = PotholeAnalyzer()
        
        # Get full path to image
        image_path = instance.image.path
        
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
        
        # Save processed image
        if results.get('processed_image'):
            instance.processed_image.save(
                f'processed_{instance.id}.jpg',
                results['processed_image'],
                save=False
            )
        
        instance.save()