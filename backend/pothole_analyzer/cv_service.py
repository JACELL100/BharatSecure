# pothole_analyzer/cv_service.py
import cv2
import numpy as np
from PIL import Image
import io
from django.core.files.base import ContentFile
from datetime import datetime

class PotholeAnalyzer:
    def __init__(self, reference_object_size_cm=None):
        """
        Initialize the pothole analyzer
        reference_object_size_cm: Known size of reference object for scale (optional)
        """
        self.reference_size = reference_object_size_cm or 10  # Default 10cm reference
        self.pixels_per_cm = None
    
    def analyze_image(self, image_path):
        """
        Main analysis function
        Returns: dict with all analysis results
        """
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image")
        
        original = img.copy()
        
        # Preprocess image
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Edge detection
        edges = cv2.Canny(blurred, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter and find largest contour (assumed to be pothole)
        if not contours:
            return None
        
        # Sort by area and get largest
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        main_contour = contours[0]
        
        # Calculate measurements
        measurements = self._calculate_measurements(main_contour, img.shape)
        
        # Estimate depth using shadow/color analysis
        depth = self._estimate_depth(img, main_contour)
        measurements['depth_estimate'] = depth
        
        # Calculate severity
        severity_info = self._calculate_severity(measurements)
        measurements.update(severity_info)
        
        # Calculate impact and repair priority
        impact_info = self._calculate_impact(measurements)
        measurements.update(impact_info)
        
        # Create annotated image
        processed_img = self._create_annotated_image(original, main_contour, measurements)
        measurements['processed_image'] = processed_img
        
        return measurements
    
    def _calculate_measurements(self, contour, img_shape):
        """Calculate physical measurements from contour"""
        # Get bounding rectangle
        x, y, w, h = cv2.boundingRect(contour)
        
        # Calculate area and perimeter
        area_pixels = cv2.contourArea(contour)
        perimeter_pixels = cv2.arcLength(contour, True)
        
        # Estimate pixels per cm (you can improve this with reference object detection)
        # For now, using image height as reference (assuming standard camera distance)
        self.pixels_per_cm = img_shape[0] / 100  # Rough estimate
        
        # Convert to cm
        width_cm = w / self.pixels_per_cm
        height_cm = h / self.pixels_per_cm
        area_cm2 = area_pixels / (self.pixels_per_cm ** 2)
        perimeter_cm = perimeter_pixels / self.pixels_per_cm
        
        return {
            'width_cm': round(width_cm, 2),
            'height_cm': round(height_cm, 2),
            'area_cm2': round(area_cm2, 2),
            'perimeter_cm': round(perimeter_cm, 2),
            'bounding_box': (x, y, w, h)
        }
    
    def _estimate_depth(self, img, contour):
        """
        Estimate depth using color intensity analysis
        Darker regions typically indicate deeper potholes
        """
        # Create mask for pothole region
        mask = np.zeros(img.shape[:2], dtype=np.uint8)
        cv2.drawContours(mask, [contour], -1, 255, -1)
        
        # Get average intensity in pothole region
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        pothole_region = cv2.bitwise_and(gray, gray, mask=mask)
        
        # Calculate mean intensity (excluding zeros)
        mean_intensity = np.mean(pothole_region[pothole_region > 0])
        
        # Estimate depth based on darkness (darker = deeper)
        # Scale: 0-255 intensity maps to depth estimate
        depth_estimate = ((255 - mean_intensity) / 255) * 15  # Max 15cm depth
        
        return round(depth_estimate, 2)
    
    def _calculate_severity(self, measurements):
        """
        Calculate severity based on size and depth
        Categories: low, medium, high, critical
        """
        area = measurements['area_cm2']
        depth = measurements['depth_estimate']
        
        # Scoring system
        severity_score = 0
        
        # Area scoring (0-40 points)
        if area < 100:
            severity_score += 10
        elif area < 300:
            severity_score += 20
        elif area < 600:
            severity_score += 30
        else:
            severity_score += 40
        
        # Depth scoring (0-40 points)
        if depth < 2:
            severity_score += 5
        elif depth < 5:
            severity_score += 15
        elif depth < 8:
            severity_score += 25
        else:
            severity_score += 40
        
        # Shape irregularity (0-20 points)
        circularity = (4 * np.pi * measurements['area_cm2']) / (measurements['perimeter_cm'] ** 2)
        if circularity < 0.5:
            severity_score += 15  # Very irregular
        elif circularity < 0.7:
            severity_score += 10
        else:
            severity_score += 5
        
        # Determine severity level
        if severity_score < 30:
            severity = 'low'
        elif severity_score < 50:
            severity = 'medium'
        elif severity_score < 70:
            severity = 'high'
        else:
            severity = 'critical'
        
        confidence = min(severity_score / 100, 0.95)  # Max 95% confidence
        
        return {
            'severity': severity,
            'confidence_score': round(confidence, 2)
        }
    
    def _calculate_impact(self, measurements):
        """Calculate impact score and repair priority"""
        area = measurements['area_cm2']
        depth = measurements['depth_estimate']
        severity = measurements['severity']
        
        # Impact score (1-10)
        impact_score = min(10, int((area / 100) + (depth / 2)))
        
        # Repair priority (1-5, 5 being highest)
        priority_map = {
            'low': 2,
            'medium': 3,
            'high': 4,
            'critical': 5
        }
        repair_priority = priority_map.get(severity, 3)
        
        # Estimated repair cost (basic formula)
        base_cost = 50  # Base cost in currency
        cost_per_cm2 = 0.5
        cost_per_cm_depth = 10
        
        estimated_cost = base_cost + (area * cost_per_cm2) + (depth * cost_per_cm_depth)
        
        return {
            'impact_score': impact_score,
            'repair_priority': repair_priority,
            'estimated_repair_cost': round(estimated_cost, 2)
        }
    
    def _create_annotated_image(self, img, contour, measurements):
        """Create annotated image with measurements overlay"""
        annotated = img.copy()
        
        # Draw contour
        cv2.drawContours(annotated, [contour], -1, (0, 255, 0), 3)
        
        # Draw bounding box
        x, y, w, h = measurements['bounding_box']
        cv2.rectangle(annotated, (x, y), (x + w, y + h), (255, 0, 0), 2)
        
        # Add text annotations
        font = cv2.FONT_HERSHEY_SIMPLEX
        
        texts = [
            f"Size: {measurements['width_cm']}x{measurements['height_cm']} cm",
            f"Area: {measurements['area_cm2']} cm2",
            f"Depth: ~{measurements['depth_estimate']} cm",
            f"Severity: {measurements['severity'].upper()}",
        ]
        
        y_offset = y - 10
        for i, text in enumerate(texts):
            y_pos = y_offset - (i * 30)
            if y_pos < 30:
                y_pos = y + h + 30 + (i * 30)
            
            cv2.putText(annotated, text, (x, y_pos), font, 0.6, (0, 255, 255), 2)
        
        # Convert to bytes for saving
        _, buffer = cv2.imencode('.jpg', annotated)
        return ContentFile(buffer.tobytes(), name='processed.jpg')