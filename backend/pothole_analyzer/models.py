# pothole_analyzer/models.py
from django.db import models
from django.core.validators import FileExtensionValidator

class PotholeAnalysis(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    image = models.ImageField(
        upload_to='potholes/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])]
    )
    processed_image = models.ImageField(upload_to='processed/', null=True, blank=True)
    
    # Analysis Results
    width_cm = models.FloatField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    area_cm2 = models.FloatField(null=True, blank=True)
    depth_estimate = models.FloatField(null=True, blank=True, help_text="Estimated depth in cm")
    perimeter_cm = models.FloatField(null=True, blank=True)
    
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    
    # Location & Impact
    location = models.CharField(max_length=255, null=True, blank=True)
    impact_score = models.IntegerField(null=True, blank=True, help_text="1-10 scale")
    repair_priority = models.IntegerField(null=True, blank=True, help_text="1-5 scale")
    estimated_repair_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    analyzed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Pothole Analysis {self.id} - {self.severity or 'Pending'}"